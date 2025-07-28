import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, BadRequestException } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserGuard } from '../auth/guards/current-user.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('chats')
@Controller('chats')
@UseGuards(JwtAuthGuard, CurrentUserGuard)
@ApiBearerAuth()
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new chat or group' })
  @ApiResponse({ status: 201, description: 'Chat created successfully', type: ChatResponseDto })
  async createChat(
    @Body() createChatDto: CreateChatDto,
    @CurrentUser() currentUser: User,
  ): Promise<ChatResponseDto> {
    if (!currentUser.tenant) {
      throw new BadRequestException('User must be associated with a tenant');
    }
    return this.chatsService.createChat(createChatDto, currentUser, currentUser.tenant);
  }

  @Get()
  @ApiOperation({ summary: 'Get all chats for current user' })
  @ApiResponse({ status: 200, description: 'Return all user chats', type: [ChatResponseDto] })
  async getUserChats(@CurrentUser() currentUser: User): Promise<ChatResponseDto[]> {
    return this.chatsService.findUserChats(currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get chat by ID' })
  @ApiResponse({ status: 200, description: 'Return chat by ID', type: ChatResponseDto })
  async getChat(@Param('id') id: string, @CurrentUser() currentUser: User): Promise<ChatResponseDto> {
    return this.chatsService.findOne(id, currentUser);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get chat messages' })
  @ApiResponse({ status: 200, description: 'Return chat messages', type: [MessageResponseDto] })
  async getChatMessages(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ): Promise<MessageResponseDto[]> {
    return this.chatsService.findMessages(id, currentUser, +page, +limit);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send message to chat' })
  @ApiResponse({ status: 201, description: 'Message sent successfully', type: MessageResponseDto })
  async sendMessage(
    @Param('id') id: string,
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() currentUser: User,
  ): Promise<MessageResponseDto> {
    return this.chatsService.createMessage(id, createMessageDto, currentUser);
  }

  @Post(':id/participants')
  @ApiOperation({ summary: 'Add participant to chat' })
  @ApiResponse({ status: 201, description: 'Participant added successfully' })
  async addParticipant(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    return this.chatsService.addParticipant(id, userId, currentUser);
  }

  @Post(':id/participants/:userId/remove')
  @ApiOperation({ summary: 'Remove participant from chat' })
  @ApiResponse({ status: 200, description: 'Participant removed successfully' })
  async removeParticipant(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    return this.chatsService.removeParticipant(id, userId, currentUser);
  }
} 