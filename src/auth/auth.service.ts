import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { Tenant } from '../tenants/entities/company.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { CompaniesService } from '../tenants/companies.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private usersService: UsersService,
    private companiesService: CompaniesService,
  ) {}

  async registerTenant(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({ 
      where: { email: registerDto.email } 
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Создаем пользователя с ролью TENANT_ADMIN
    const user = this.usersRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      role: UserRole.TENANT_ADMIN
    });

    // Создаем тенанта и связываем с пользователем
    const tenant = await this.companiesService.create({
      name: registerDto.companyName,
      industry: registerDto.industry
    }, user);

    const { password, ...result } = user;

    const payload = { 
      sub: user.id, 
      email: user.email,
      role: user.role,
      tenantId: tenant.id
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        ...result,
        tenantId: tenant.id
      }
    };
  }

  async registerUser(registerDto: RegisterDto, currentUser: User) {
    // Проверяем права доступа
    if (currentUser.role !== UserRole.SUPER_ADMIN && 
        (currentUser.role !== UserRole.TENANT_ADMIN || currentUser.tenant?.id !== registerDto.tenantId)) {
      throw new BadRequestException('Access denied');
    }

    // Проверяем роль
    if (registerDto.role === UserRole.SUPER_ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Only SUPER_ADMIN can create SUPER_ADMIN users');
    }

    const existingUser = await this.usersRepository.findOne({ 
      where: { email: registerDto.email } 
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword
    });

    await this.usersRepository.save(user);

    const { password, ...result } = user;

    const payload = { 
      sub: user.id, 
      email: user.email,
      role: user.role,
      tenantId: user.tenant?.id
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: result
    };
  }
} 