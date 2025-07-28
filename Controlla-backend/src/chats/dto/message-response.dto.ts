import { ApiProperty } from '@nestjs/swagger';

export class MessageAuthorDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;
}

export class MessageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ type: MessageAuthorDto })
  author: MessageAuthorDto;

  @ApiProperty()
  isEdited: boolean;

  @ApiProperty({ required: false })
  editedAt?: Date;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
} 