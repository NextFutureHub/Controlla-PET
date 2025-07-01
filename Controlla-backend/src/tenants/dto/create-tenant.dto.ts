import { IsString, IsOptional, IsBoolean, IsObject, IsEmail, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AdminUserDto {
  @ApiProperty({
    example: 'admin@acme.com',
    description: 'Email of the tenant admin'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password for the tenant admin'
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'First name of the tenant admin'
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the tenant admin'
  })
  @IsString()
  lastName: string;
}

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

  @ApiProperty({
    description: 'Admin user data for the tenant',
    type: AdminUserDto
  })
  @ValidateNested()
  @Type(() => AdminUserDto)
  admin: AdminUserDto;
}

export class TenantRegistrationResponseDto {
  @ApiProperty({
    description: 'The created tenant'
  })
  tenant: any;

  @ApiProperty({
    description: 'Access token for the admin user'
  })
  access_token: string;

  @ApiProperty({
    description: 'Refresh token for the admin user'
  })
  refresh_token: string;

  @ApiProperty({
    description: 'The admin user data'
  })
  user: any;
} 