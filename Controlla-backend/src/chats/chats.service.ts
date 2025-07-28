import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat, ChatType } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { ChatParticipant, ParticipantRole } from './entities/chat-participant.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private chatsRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(ChatParticipant)
    private participantsRepository: Repository<ChatParticipant>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createChat(createChatDto: CreateChatDto, currentUser: User, tenant: Tenant): Promise<ChatResponseDto> {
    if (!tenant) {
      throw new BadRequestException('Tenant is required');
    }
    
    const chat = this.chatsRepository.create({
      ...createChatDto,
      tenant,
      createdBy: currentUser,
    });

    const savedChat = await this.chatsRepository.save(chat);

    // Добавляем создателя как участника с ролью админа
    await this.participantsRepository.save({
      chat: savedChat,
      user: currentUser,
      role: ParticipantRole.ADMIN,
      joinedAt: new Date(),
    });

    // Добавляем других участников, если это группа
    if (createChatDto.participantIds && createChatDto.participantIds.length > 0) {
      // Исключаем создателя из списка участников
      const participantIds = createChatDto.participantIds.filter(id => id !== currentUser.id);
      
      if (participantIds.length > 0) {
        const participants = await this.usersRepository
          .createQueryBuilder('user')
          .leftJoinAndSelect('user.tenant', 'tenant')
          .where('user.id IN (:...ids)', { ids: participantIds })
          .getMany();
        
        // Проверяем, что все участники из той же компании
        const invalidParticipants = participants.filter(p => p.tenant?.id !== tenant.id);
        if (invalidParticipants.length > 0) {
          throw new BadRequestException('All participants must be from the same company');
        }

        const participantEntities = participants.map(user => ({
          chat: savedChat,
          user,
          role: ParticipantRole.MEMBER,
          joinedAt: new Date(),
        }));

        await this.participantsRepository.save(participantEntities);
      }
    }

    return this.findOne(savedChat.id, currentUser);
  }

  async findUserChats(currentUser: User): Promise<ChatResponseDto[]> {
    const chats = await this.chatsRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.participants', 'participant')
      .leftJoinAndSelect('participant.user', 'user')
      .leftJoinAndSelect('chat.messages', 'message')
      .leftJoinAndSelect('message.author', 'author')
      .where('participant.user.id = :userId', { userId: currentUser.id })
      .andWhere('participant.isActive = :isActive', { isActive: true })
      .andWhere('chat.isActive = :chatActive', { chatActive: true })
      .orderBy('chat.updatedAt', 'DESC')
      .getMany();

    return chats.map(chat => this.mapChatToResponseDto(chat, currentUser));
  }

  async findOne(chatId: string, currentUser: User): Promise<ChatResponseDto> {
    // Сначала проверяем, что пользователь является участником чата
    const participant = await this.participantsRepository.findOne({
      where: { chat: { id: chatId }, user: { id: currentUser.id }, isActive: true },
    });

    if (!participant) {
      throw new NotFoundException('Chat not found');
    }

    // Затем загружаем чат со всеми участниками
    const chat = await this.chatsRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.participants', 'participant')
      .leftJoinAndSelect('participant.user', 'user')
      .leftJoinAndSelect('chat.messages', 'message')
      .leftJoinAndSelect('message.author', 'author')
      .where('chat.id = :chatId', { chatId })
      .andWhere('participant.isActive = :isActive', { isActive: true })
      .getOne();

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return this.mapChatToResponseDto(chat, currentUser);
  }

  async findMessages(chatId: string, currentUser: User, page = 1, limit = 50): Promise<MessageResponseDto[]> {
    // Проверяем, что пользователь является участником чата
    const participant = await this.participantsRepository.findOne({
      where: { chat: { id: chatId }, user: { id: currentUser.id }, isActive: true },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    const messages = await this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.author', 'author')
      .where('message.chat.id = :chatId', { chatId })
      .andWhere('message.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('message.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return messages.reverse().map(message => this.mapMessageToResponseDto(message));
  }

  async createMessage(chatId: string, createMessageDto: CreateMessageDto, currentUser: User): Promise<MessageResponseDto> {
    // Проверяем, что пользователь является участником чата
    const participant = await this.participantsRepository.findOne({
      where: { chat: { id: chatId }, user: { id: currentUser.id }, isActive: true },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    const chat = await this.chatsRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const message = this.messagesRepository.create({
      ...createMessageDto,
      chat,
      author: currentUser,
    });

    const savedMessage = await this.messagesRepository.save(message);

    // Обновляем время последнего сообщения в чате
    await this.chatsRepository.update(chatId, { updatedAt: new Date() });

    return this.mapMessageToResponseDto(savedMessage);
  }

  async addParticipant(chatId: string, userId: string, currentUser: User): Promise<void> {
    // Проверяем права администратора
    const participant = await this.participantsRepository.findOne({
      where: { chat: { id: chatId }, user: { id: currentUser.id }, isActive: true },
    });

    if (!participant || participant.role !== ParticipantRole.ADMIN) {
      throw new ForbiddenException('Only admins can add participants');
    }

    // Проверяем, что пользователь не уже участник
    const existingParticipant = await this.participantsRepository.findOne({
      where: { chat: { id: chatId }, user: { id: userId }, isActive: true },
    });

    if (existingParticipant) {
      throw new BadRequestException('User is already a participant');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Проверяем, что пользователь из той же компании
    const chat = await this.chatsRepository.findOne({ 
      where: { id: chatId },
      relations: ['tenant']
    });
    
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    
    if (user.tenant?.id !== chat.tenant.id) {
      throw new BadRequestException('User must be from the same company');
    }

    await this.participantsRepository.save({
      chat: { id: chatId },
      user,
      role: ParticipantRole.MEMBER,
      joinedAt: new Date(),
    });
  }

  async removeParticipant(chatId: string, userId: string, currentUser: User): Promise<void> {
    // Проверяем права администратора
    const participant = await this.participantsRepository.findOne({
      where: { chat: { id: chatId }, user: { id: currentUser.id }, isActive: true },
    });

    if (!participant || participant.role !== ParticipantRole.ADMIN) {
      throw new ForbiddenException('Only admins can remove participants');
    }

    const targetParticipant = await this.participantsRepository.findOne({
      where: { chat: { id: chatId }, user: { id: userId }, isActive: true },
    });

    if (!targetParticipant) {
      throw new NotFoundException('Participant not found');
    }

    // Нельзя удалить себя из чата
    if (userId === currentUser.id) {
      throw new BadRequestException('Cannot remove yourself from chat');
    }

    await this.participantsRepository.update(
      { id: targetParticipant.id },
      { isActive: false, leftAt: new Date() }
    );
  }

  private mapChatToResponseDto(chat: Chat, currentUser: User): ChatResponseDto {
    const participants = chat.participants
      .filter(p => p.isActive)
      .map(p => ({
        id: p.user.id,
        firstName: p.user.firstName,
        lastName: p.user.lastName,
        email: p.user.email,
        role: p.role,
        isActive: p.isActive,
        joinedAt: p.joinedAt || undefined,
      }));

    const lastMessage = chat.messages
      .filter(m => !m.isDeleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    return {
      id: chat.id,
      name: chat.name,
      description: chat.description,
      type: chat.type,
      avatar: chat.avatar,
      isActive: chat.isActive,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      participants,
      lastMessageAt: lastMessage?.createdAt,
      unreadCount: 0, // TODO: implement unread count
    };
  }

  private mapMessageToResponseDto(message: Message): MessageResponseDto {
    return {
      id: message.id,
      content: message.content,
      author: {
        id: message.author.id,
        firstName: message.author.firstName,
        lastName: message.author.lastName,
        email: message.author.email,
      },
      isEdited: message.isEdited,
      editedAt: message.editedAt,
      isDeleted: message.isDeleted,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }
} 