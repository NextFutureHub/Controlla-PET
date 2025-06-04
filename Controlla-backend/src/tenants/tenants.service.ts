import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UserRole } from '../users/enums/user-role.enum';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createTenantDto: CreateTenantDto, owner: User): Promise<Tenant> {
    // Проверяем уникальность названия тенанта
    const existingTenant = await this.tenantsRepository.findOne({
      where: { name: createTenantDto.name }
    });

    if (existingTenant) {
      throw new ConflictException('Tenant with this name already exists');
    }

    // Создаем тенанта
    const tenant = this.tenantsRepository.create({
      ...createTenantDto,
      ownerId: owner.id,
      users: [owner]
    });

    // Сохраняем тенанта
    const savedTenant = await this.tenantsRepository.save(tenant);

    // Обновляем пользователя
    owner.tenant = savedTenant;
    owner.role = UserRole.TENANT_ADMIN;
    await this.usersRepository.save(owner);

    return savedTenant;
  }

  async findAll(user: User): Promise<Tenant[]> {
    if (user.role === UserRole.SUPER_ADMIN) {
      return this.tenantsRepository.find({
        relations: ['users', 'projects', 'contractors']
      });
    } else if (user.role === UserRole.TENANT_ADMIN) {
      return this.tenantsRepository.find({
        where: { id: user.tenant?.id },
        relations: ['users', 'projects', 'contractors']
      });
    }
    throw new BadRequestException('Access denied');
  }

  async findOne(id: string, user?: User): Promise<Tenant> {
    const tenant = await this.tenantsRepository.findOne({
      where: { id },
      relations: ['users', 'projects', 'contractors']
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    if (!user || user.role === UserRole.SUPER_ADMIN) {
      return tenant;
    }

    if (user.role === UserRole.TENANT_ADMIN && tenant.id === user.tenant?.id) {
      return tenant;
    }

    throw new BadRequestException('Access denied');
  }

  async update(id: string, updateTenantDto: UpdateTenantDto, user: User): Promise<Tenant> {
    const tenant = await this.findOne(id, user);
    Object.assign(tenant, updateTenantDto);
    return this.tenantsRepository.save(tenant);
  }

  async remove(id: string, user: User): Promise<void> {
    await this.findOne(id, user); // Проверка доступа
    const result = await this.tenantsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
  }

  async addUser(tenantId: string, newUser: User, role: UserRole, ownerUser: User): Promise<User> {
    // Проверяем права доступа
    if (ownerUser.role !== UserRole.SUPER_ADMIN && 
        (ownerUser.role !== UserRole.TENANT_ADMIN || ownerUser.tenant?.id !== tenantId)) {
      throw new BadRequestException('Access denied');
    }

    // Проверяем, что роль допустима
    if (role === UserRole.SUPER_ADMIN && ownerUser.role !== UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Only super admin can create super admin users');
    }

    const tenant = await this.findOne(tenantId, ownerUser);
    newUser.tenant = tenant;
    newUser.role = role;
    return this.usersRepository.save(newUser);
  }

  async removeUser(tenantId: string, userId: string, ownerUser: User): Promise<void> {
    // Проверяем права доступа
    if (ownerUser.role !== UserRole.SUPER_ADMIN && 
        (ownerUser.role !== UserRole.TENANT_ADMIN || ownerUser.tenant?.id !== tenantId)) {
      throw new BadRequestException('Access denied');
    }

    const tenant = await this.findOne(tenantId, ownerUser);
    const user = await this.usersRepository.findOne({
      where: { id: userId, tenant: { id: tenantId } }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found in tenant ${tenantId}`);
    }

    // Нельзя удалить владельца тенанта
    if (user.id === tenant.ownerId) {
      throw new BadRequestException('Cannot remove tenant owner');
    }

    user.tenant = null;
    await this.usersRepository.save(user);
  }
} 