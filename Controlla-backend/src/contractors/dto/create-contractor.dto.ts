import { IsString, IsEmail, IsEnum, IsNumber, IsOptional, Min, Max, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContractorRole, ContractorStatus } from '../entities/contractor.entity';
import { Type } from 'class-transformer';

export class CreateContractorDto {
  @ApiProperty({
    description: 'Имя подрядчика',
    example: 'John Doe'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email подрядчика',
    example: 'john.doe@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Роль подрядчика',
    enum: ContractorRole,
    example: ContractorRole.DEVELOPER
  })
  @IsEnum(ContractorRole)
  role: ContractorRole;

  @ApiProperty({
    description: 'Почасовая ставка',
    minimum: 0,
    example: 50,
    type: Number
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  hourlyRate: number;

  @ApiProperty({
    description: 'Местоположение подрядчика',
    example: 'New York, USA',
    required: false
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Статус подрядчика',
    enum: ContractorStatus,
    example: ContractorStatus.ACTIVE,
    required: false,
    default: ContractorStatus.ACTIVE
  })
  @IsEnum(ContractorStatus)
  @IsOptional()
  status?: ContractorStatus = ContractorStatus.ACTIVE;

  @ApiProperty({
    description: 'Аватар подрядчика (файл)',
    type: 'string',
    format: 'binary',
    required: false
  })
  @IsOptional()
  @IsString()
  avatar?: string;
} 