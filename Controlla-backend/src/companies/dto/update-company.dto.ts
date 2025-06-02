import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCompanyDto {
  @ApiProperty({
    description: 'Company name',
    example: 'Acme Corp',
    required: false
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Company description',
    example: 'A leading technology company',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Company address',
    example: '123 Business St, City, Country',
    required: false
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Company phone number',
    example: '+1234567890',
    required: false
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Company email',
    example: 'contact@company.com',
    required: false
  })
  @IsEmail()
  @IsOptional()
  email?: string;
} 