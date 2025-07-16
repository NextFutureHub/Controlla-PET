import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { Tenant } from '../tenants/entities/tenant.entity';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto & { tenant?: Tenant | null }): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find();
    return users.map(({ password, ...user }) => user);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async findByEmailOrNull(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user || null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.usersRepository.save({
      ...user,
      ...updateUserDto,
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }
} 