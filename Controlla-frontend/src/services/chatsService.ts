import { apiService } from './apiService';

export interface Chat {
  id: string;
  name: string;
  description?: string;
  type: 'private' | 'group';
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  participants: ChatParticipant[];
  lastMessageAt?: Date;
  unreadCount?: number;
}

export interface ChatParticipant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'member';
  isActive: boolean;
  joinedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChatDto {
  name: string;
  description?: string;
  type: 'private' | 'group';
  avatar?: string;
  participantIds?: string[];
}

export interface CreateMessageDto {
  content: string;
}

export const chatsService = {
  async getChats(): Promise<Chat[]> {
    const response = await apiService.get('/chats');
    return response;
  },

  async getChat(chatId: string): Promise<Chat> {
    const response = await apiService.get(`/chats/${chatId}`);
    return response;
  },

  async getMessages(chatId: string, page = 1, limit = 50): Promise<Message[]> {
    const response = await apiService.get(`/chats/${chatId}/messages`, { page, limit });
    return response;
  },

  async createChat(createChatDto: CreateChatDto): Promise<Chat> {
    const response = await apiService.post('/chats', createChatDto);
    return response;
  },

  async sendMessage(chatId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    const response = await apiService.post(`/chats/${chatId}/messages`, createMessageDto);
    return response;
  },

  async addParticipant(chatId: string, userId: string): Promise<void> {
    await apiService.post(`/chats/${chatId}/participants`, { userId });
  },

  async removeParticipant(chatId: string, userId: string): Promise<void> {
    await apiService.post(`/chats/${chatId}/participants/${userId}/remove`);
  },
}; 