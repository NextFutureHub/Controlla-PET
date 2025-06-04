import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({
    example: 'Acme Corp',
    description: 'Name of the tenant'
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Technology',
    description: 'Industry of the tenant',
    required: false
  })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiProperty({
    example: 'https://acme.com',
    description: 'Website of the tenant',
    required: false
  })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number of the tenant',
    required: false
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: '123 Main St, City, Country',
    description: 'Address of the tenant',
    required: false
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    example: 'https://example.com/logo.png',
    description: 'Logo URL of the tenant',
    required: false
  })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the tenant is active',
    required: false
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: { theme: 'dark', language: 'en' },
    description: 'Settings of the tenant',
    required: false
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
} 