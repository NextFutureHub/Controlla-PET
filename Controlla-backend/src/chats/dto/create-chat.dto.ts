import { IsString, IsEnum, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChatType } from '../entities/chat.entity';

export class CreateChatDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ChatType })
  @IsEnum(ChatType)
  type: ChatType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  participantIds?: string[];
} 