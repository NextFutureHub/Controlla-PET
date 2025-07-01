import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptInviteDto {
  @ApiProperty({
    example: 'abc123def456',
    description: 'Код приглашения'
  })
  @IsString()
  code: string;
} 