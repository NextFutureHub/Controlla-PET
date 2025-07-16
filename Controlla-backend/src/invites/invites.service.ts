import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invite } from './entities/invite.entity';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { InviteCodeDto } from './dto/create-invite.dto';
import * as crypto from 'crypto';

@Injectable()
export class InvitesService {
  constructor(
    @InjectRepository(Invite)
    private invitesRepository: Repository<Invite>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
  ) {}

  private async checkUserTenantAccess(user: User, tenantId: string): Promise<void> {
    console.log('user.role:', user.role);
    console.log('user.tenant:', user.tenant);
    console.log('user.tenantId:', (user as any).tenantId);
  console.log('tenantId:', tenantId);
    const userTenantId = user.tenant?.id || (user as any).tenantId;
    if (
      user.role !== 'SUPER_ADMIN' &&
      (user.role !== 'TENANT_ADMIN' || userTenantId !== tenantId)
    ) {
      throw new ForbiddenException('Insufficient role to generate invite code');
    }
  }

  private generateShortCode(): string {
    // 12 символов, только буквы и цифры
    return crypto.randomBytes(9).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  }

  async generateCodeInvite(dto: InviteCodeDto, user: User): Promise<{ code: string; expiresAt: Date }> {
    await this.checkUserTenantAccess(user, dto.tenantId);
    const tenant = await this.tenantsRepository.findOne({ where: { id: dto.tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    const code = this.generateShortCode();
    const days = dto.expiresInDays ? parseInt(dto.expiresInDays, 10) : 7;
    const expiresAt = new Date(Date.now() + (days * 24 * 60 * 60 * 1000));
    const invite = this.invitesRepository.create({
      code,
      tenant,
      role: dto.role,
      isUsed: false,
      usedBy: null,
      expiresAt,
    });
    await this.invitesRepository.save(invite);
    return { code, expiresAt };
  }

  async acceptCodeInvite(code: string, user: User): Promise<{ success: boolean; tenant: Tenant }> {
    const invite = await this.invitesRepository.findOne({ where: { code }, relations: ['tenant'] });
    if (!invite) throw new NotFoundException('Invalid invite code');
    if (invite.isUsed) throw new BadRequestException('Invite code already used');
    if (invite.expiresAt && invite.expiresAt < new Date()) throw new BadRequestException('Invite code expired');
    // Проверка: пользователь уже в этом тенанте?
    if (user.tenant && user.tenant.id === invite.tenant.id) throw new BadRequestException('Already in this tenant');
    // Присоединяем пользователя к тенанту
    user.tenant = invite.tenant;
    await this.usersRepository.save(user);
    invite.isUsed = true;
    invite.usedBy = user;
    await this.invitesRepository.save(invite);
    return { success: true, tenant: invite.tenant };
  }

  async getActiveCodesForTenant(tenantId: string, user: User) {
    await this.checkUserTenantAccess(user, tenantId);
    const now = new Date();
    return this.invitesRepository.createQueryBuilder('invite')
      .where('invite.tenantId = :tenantId', { tenantId })
      .andWhere('invite.isUsed = false')
      .andWhere('(invite.expiresAt IS NULL OR invite.expiresAt > :now)', { now })
      .orderBy('invite.createdAt', 'DESC')
      .getMany();
  }
} 