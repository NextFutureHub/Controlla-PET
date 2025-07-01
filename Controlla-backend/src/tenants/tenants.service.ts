import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { CreateTenantDto, TenantRegistrationResponseDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UserRole } from '../users/enums/user-role.enum';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<TenantRegistrationResponseDto> {
    if (!createTenantDto.admin) {
      throw new BadRequestException('Admin data is required');
    }
    // Проверяем уникальность названия тенанта
    const existingTenant = await this.tenantsRepository.findOne({
      where: { name: createTenantDto.name }
    });

    if (existingTenant) {
      throw new ConflictException('Tenant with this name already exists');
    }

    // Проверяем, что email администратора не занят
    const existingUser = await this.usersRepository.findOne({
      where: { email: createTenantDto.admin.email }
    });

    if (existingUser) {
      throw new ConflictException('Admin email already exists');
    }

    // Создаем тенанта
    const tenant = this.tenantsRepository.create({
      name: createTenantDto.name,
      industry: createTenantDto.industry,
      website: createTenantDto.website,
      phone: createTenantDto.phone,
      address: createTenantDto.address,
      logo: createTenantDto.logo,
      isActive: createTenantDto.isActive ?? true,
      settings: createTenantDto.settings,
    });

    // Сохраняем тенанта
    const savedTenant = await this.tenantsRepository.save(tenant);

    // Создаем администратора тенанта
    const hashedPassword = await bcrypt.hash(createTenantDto.admin.password, 10);
    const adminUser = this.usersRepository.create({
      email: createTenantDto.admin.email,
      password: hashedPassword,
      firstName: createTenantDto.admin.firstName,
      lastName: createTenantDto.admin.lastName,
      role: UserRole.TENANT_ADMIN,
      tenant: savedTenant,
    });

    // Сохраняем администратора
    const savedAdmin = await this.usersRepository.save(adminUser);

    // Обновляем тенанта с ID владельца
    savedTenant.ownerId = savedAdmin.id;
    await this.tenantsRepository.save(savedTenant);

    // Создаем JWT токены
    const payload = { 
      sub: savedAdmin.id, 
      email: savedAdmin.email,
      role: savedAdmin.role,
      tenantId: savedTenant.id 
    };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Подготавливаем ответ
    const { password, ...userResponse } = savedAdmin;

    return {
      tenant: savedTenant,
      access_token,
      refresh_token,
      user: userResponse
    };
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantsRepository.find({
      relations: ['users', 'projects', 'contractors']
    });
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantsRepository.findOne({
      where: { id },
      relations: ['users', 'projects', 'contractors']
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);
    Object.assign(tenant, updateTenantDto);
    return this.tenantsRepository.save(tenant);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Проверка существования
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

    const tenant = await this.findOne(tenantId);
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

    const tenant = await this.findOne(tenantId);
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