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

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      sub: user.id, 
      email: user.email,
      role: user.role,
      tenantId: user.tenant?.id 
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    let tenant: Tenant | null = null;
    if (registerDto.tenantId) {
      tenant = await this.tenantsService.findOne(registerDto.tenantId);
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      tenant,
      role: registerDto.role || UserRole.USER
    });

    const payload = { 
      sub: user.id, 
      email: user.email,
      role: user.role,
      tenantId: user.tenant?.id 
    };

    const userResponse = this.toUserResponseDto(user);

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: userResponse
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

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
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

      return {
        access_token: this.jwtService.sign(newPayload),
        refresh_token: this.jwtService.sign(newPayload, { expiresIn: '7d' })
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
} 