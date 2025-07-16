import { IsEmail, IsString, IsEnum, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/enums/user-role.enum';

export class CreateInviteDto {
  @ApiProperty({
    example: 'user@company.com',
    description: 'Email пользователя для приглашения'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'uuid',
    description: 'ID тенанта'
  })
  @IsUUID()
  tenantId: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.PROJECT_MANAGER,
    description: 'Роль пользователя в тенанте'
  })
  @IsEnum(UserRole)
  role: UserRole;
}

export class InviteCodeDto {
  @ApiProperty({
    example: 'uuid',
    description: 'ID тенанта'
  })
  @IsUUID()
  tenantId: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
    description: 'Роль пользователя в тенанте (по умолчанию USER)'
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    example: 7,
    description: 'Срок действия (дней), опционально'
  })
  @IsOptional()
  @IsString()
  expiresInDays?: string;
} 