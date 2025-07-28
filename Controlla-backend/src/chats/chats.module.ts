import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { ChatParticipant } from './entities/chat-participant.entity';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { TenantMiddleware } from '../auth/middleware/tenant.middleware';
import { CurrentUserGuard } from '../auth/guards/current-user.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Message, ChatParticipant, User, Tenant]),
  ],
  controllers: [ChatsController],
  providers: [ChatsService, TenantMiddleware, CurrentUserGuard],
  exports: [ChatsService],
})
export class ChatsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: 'chats', method: RequestMethod.ALL });
  }
} 