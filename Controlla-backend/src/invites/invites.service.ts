import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invite } from './entities/invite.entity';
import { InviteAudit, InviteAuditAction } from './entities/invite-audit.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { CreateInviteDto } from './dto/create-invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { UserRole as UserRoleEnum } from '../users/enums/user-role.enum';
import * as crypto from 'crypto';

@Injectable()
export class InvitesService {
  constructor(
    @InjectRepository(Invite)
    private invitesRepository: Repository<Invite>,
    @InjectRepository(InviteAudit)
    private inviteAuditRepository: Repository<InviteAudit>,
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
  ) {}

  private generateInviteCode(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private async logAudit(
    inviteId: string, 
    action: InviteAuditAction, 
    performedBy?: string, 
    metadata?: Record<string, any>
  ): Promise<void> {
    const audit = this.inviteAuditRepository.create({
      inviteId,
      action,
      performedBy,
      metadata
    });
    await this.inviteAuditRepository.save(audit);
  }

  private async checkUserTenantAccess(user: User, tenantId: string): Promise<void> {
    const userRole = await this.userRolesRepository.findOne({
      where: {
        userId: user.id,
        tenantId: tenantId,
        isActive: true
      }
    });

    if (!userRole) {
      throw new ForbiddenException('User does not have access to this tenant');
    }

    // Проверяем роль пользователя
    if (![UserRoleEnum.SUPER_ADMIN, UserRoleEnum.TENANT_ADMIN, UserRoleEnum.PROJECT_MANAGER].includes(userRole.role)) {
      throw new ForbiddenException('Insufficient role to manage invites');
    }
  }

  async create(createInviteDto: CreateInviteDto, user: User | null): Promise<Invite> {
    // Не проверяем права доступа к тенанту, если user отсутствует (публичный вызов)
    if (user) {
      await this.checkUserTenantAccess(user, createInviteDto.tenantId);
    }

    // Проверяем существование тенанта
    const tenant = await this.tenantsRepository.findOne({
      where: { id: createInviteDto.tenantId }
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Проверяем, не существует ли уже приглашение для этого email в этом тенанте
    const existingInvite = await this.invitesRepository.findOne({
      where: {
        email: createInviteDto.email,
        tenantId: createInviteDto.tenantId,
        accepted: false
      }
    });

    if (existingInvite) {
      throw new ConflictException('Invite already exists for this email in this tenant');
    }

    // Создаем приглашение
    const invite = this.invitesRepository.create({
      ...createInviteDto,
      code: this.generateInviteCode(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
    });

    const savedInvite = await this.invitesRepository.save(invite);

    // Логируем создание (performedBy = user?.id или undefined)
    await this.logAudit(savedInvite.id, InviteAuditAction.CREATED, user?.id, {
      email: createInviteDto.email,
      role: createInviteDto.role,
      tenantId: createInviteDto.tenantId
    });

    return savedInvite;
  }

  async accept(acceptInviteDto: AcceptInviteDto): Promise<{ success: boolean; message: string }> {
    const invite = await this.invitesRepository.findOne({
      where: { code: acceptInviteDto.code }
    });

    if (!invite) {
      throw new NotFoundException('Invalid invite code');
    }

    if (invite.accepted) {
      throw new BadRequestException('Invite already accepted');
    }

    if (invite.expiresAt < new Date()) {
      // Логируем истечение
      await this.logAudit(invite.id, InviteAuditAction.EXPIRED);
      throw new BadRequestException('Invite has expired');
    }

    // Находим пользователя по email
    const user = await this.usersRepository.findOne({
      where: { email: invite.email }
    });

    if (!user) {
      throw new BadRequestException('User not found with this email');
    }

    // Проверяем, не состоит ли пользователь уже в этом тенанте
    const existingUserRole = await this.userRolesRepository.findOne({
      where: {
        userId: user.id,
        tenantId: invite.tenantId,
        isActive: true
      }
    });

    if (existingUserRole) {
      throw new BadRequestException('User is already a member of this tenant');
    }

    // Создаем связь пользователя с тенантом
    const userRole = this.userRolesRepository.create({
      userId: user.id,
      tenantId: invite.tenantId,
      role: invite.role,
      isActive: true
    });

    await this.userRolesRepository.save(userRole);

    // Отмечаем приглашение как принятое
    invite.accepted = true;
    invite.acceptedBy = user.id;
    invite.acceptedAt = new Date();
    await this.invitesRepository.save(invite);

    // Логируем принятие
    await this.logAudit(invite.id, InviteAuditAction.ACCEPTED, user.id, {
      acceptedAt: invite.acceptedAt
    });

    return {
      success: true,
      message: 'Invite accepted successfully'
    };
  }

  async findByTenant(tenantId: string, user: User): Promise<Invite[]> {
    await this.checkUserTenantAccess(user, tenantId);

    return this.invitesRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' }
    });
  }

  async findByEmail(email: string, user: User): Promise<Invite[]> {
    // Пользователь может видеть только свои приглашения
    if (user.email !== email) {
      throw new ForbiddenException('Can only view own invites');
    }

    return this.invitesRepository.find({
      where: { email },
      order: { createdAt: 'DESC' }
    });
  }

  async remove(id: string, user: User): Promise<void> {
    const invite = await this.invitesRepository.findOne({
      where: { id }
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    await this.checkUserTenantAccess(user, invite.tenantId);

    const result = await this.invitesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Invite not found');
    }

    // Логируем удаление
    await this.logAudit(id, InviteAuditAction.DELETED, user.id);
  }

  async resend(id: string, user: User): Promise<Invite> {
    const invite = await this.invitesRepository.findOne({
      where: { id }
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    await this.checkUserTenantAccess(user, invite.tenantId);

    if (invite.accepted) {
      throw new BadRequestException('Cannot resend accepted invite');
    }

    // Обновляем код и срок действия
    const oldCode = invite.code;
    invite.code = this.generateInviteCode();
    invite.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 дней

    const updatedInvite = await this.invitesRepository.save(invite);

    // Логируем повторную отправку
    await this.logAudit(id, InviteAuditAction.RESENT, user.id, {
      oldCode,
      newCode: invite.code,
      newExpiresAt: invite.expiresAt
    });

    return updatedInvite;
  }

  async getAuditLog(inviteId: string, user: User): Promise<InviteAudit[]> {
    const invite = await this.invitesRepository.findOne({
      where: { id: inviteId }
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    await this.checkUserTenantAccess(user, invite.tenantId);

    return this.inviteAuditRepository.find({
      where: { inviteId },
      order: { createdAt: 'DESC' },
      relations: ['user']
    });
  }
} 