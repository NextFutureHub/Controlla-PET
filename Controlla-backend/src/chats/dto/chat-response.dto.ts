import { ApiProperty } from '@nestjs/swagger';
import { ChatType } from '../entities/chat.entity';
import { ParticipantRole } from '../entities/chat-participant.entity';

export class ChatParticipantResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: ParticipantRole })
  role: ParticipantRole;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false })
  joinedAt?: Date;
}

export class ChatResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ enum: ChatType })
  type: ChatType;

  @ApiProperty({ required: false })
  avatar?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [ChatParticipantResponseDto] })
  participants: ChatParticipantResponseDto[];

  @ApiProperty()
  lastMessageAt?: Date;

  @ApiProperty()
  unreadCount?: number;
} 