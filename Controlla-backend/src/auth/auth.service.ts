import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { LoginDto, RegisterDto, RefreshTokenDto, AuthResponseDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { Tenant } from '../tenants/entities/tenant.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private usersService: UsersService,
    private tenantsService: TenantsService,
  ) {}

  private toUserResponseDto(user: Partial<User>): UserResponseDto {
    const { password, ...result } = user;
    return {
      ...result,
      tenantId: result.tenant?.id
    } as UserResponseDto;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return this.toUserResponseDto(user);
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto & { tenant: any }> {
    const userEntity = await this.usersRepository.findOne({
      where: { email: loginDto.email },
      relations: ['tenant'],
    });
    if (!userEntity || !(await bcrypt.compare(loginDto.password, userEntity.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const user = this.toUserResponseDto(userEntity);
    let tenant = userEntity.tenant ? await this.tenantsService.findOne(userEntity.tenant.id) : null;

    const payload = { 
      sub: user.id, 
      email: user.email,
      role: user.role,
      tenantId: user.tenantId 
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '14d' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '30d' }),
      user,
      tenant
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto & { tenant: any }> {
    const existingUser = await this.usersService.findByEmailOrNull(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    let tenant: Tenant | null = null;
    if (registerDto.tenantId) {
      tenant = await this.tenantsService.findOne(registerDto.tenantId);
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      tenant,
      role: registerDto.role || UserRole.USER
    });

    // Получаем пользователя с relations: ['tenant']
    const userEntity = await this.usersRepository.findOne({
      where: { email: registerDto.email },
      relations: ['tenant'],
    });
    if (!userEntity) {
      throw new UnauthorizedException('User not found after registration');
    }
    const user = this.toUserResponseDto(userEntity);
    let tenantObj = userEntity.tenant ? await this.tenantsService.findOne(userEntity.tenant.id) : null;

    const payload = { 
      sub: user.id, 
      email: user.email,
      role: user.role,
      tenantId: user.tenantId 
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '14d' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '30d' }),
      user,
      tenant: tenantObj
    };
  }

  async registerUser(registerDto: RegisterDto, currentUser: User): Promise<AuthResponseDto & { tenant: any }> {
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

    await this.usersRepository.save(this.usersRepository.create({
      ...registerDto,
      password: hashedPassword
    }));

    // Получаем пользователя с relations: ['tenant']
    const userEntity = await this.usersRepository.findOne({
      where: { email: registerDto.email },
      relations: ['tenant'],
    });
    if (!userEntity) {
      throw new UnauthorizedException('User not found after registration');
    }
    const { password, ...result } = userEntity;
    let tenant = userEntity.tenant ? await this.tenantsService.findOne(userEntity.tenant.id) : null;

    const payload = { 
      sub: userEntity.id, 
      email: userEntity.email,
      role: userEntity.role,
      tenantId: userEntity.tenant?.id
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '14d' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '30d' }),
      user: result,
      tenant
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ access_token: string; refresh_token: string; tenant: any }> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken);
      const user = await this.usersRepository.findOne({ 
        where: { id: payload.sub },
        relations: ['tenant']
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload = { 
        sub: user.id, 
        email: user.email,
        role: user.role,
        tenantId: user.tenant?.id
      };

      let tenant = user.tenant ? await this.tenantsService.findOne(user.tenant.id) : null;

      return {
        access_token: this.jwtService.sign(newPayload, { expiresIn: '14d' }),
        refresh_token: this.jwtService.sign(newPayload, { expiresIn: '30d' }),
        tenant
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
} 