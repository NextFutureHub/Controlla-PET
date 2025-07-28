import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { ContractorsModule } from './contractors/contractors.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { InvitesModule } from './invites/invites.module';
import { ChatsModule } from './chats/chats.module';
import { Tenant } from './tenants/entities/tenant.entity';
import { User } from './users/entities/user.entity';
import { UserRole } from './users/entities/user-role.entity';
import { Project } from './projects/entities/project.entity';
import { Contractor } from './contractors/entities/contractor.entity';
import { Task } from './tasks/entities/task.entity';
import { Subtask } from './tasks/entities/subtask.entity';
import { Invite } from './invites/entities/invite.entity';
import { InviteAudit } from './invites/entities/invite-audit.entity';
import { Chat } from './chats/entities/chat.entity';
import { Message } from './chats/entities/message.entity';
import { ChatParticipant } from './chats/entities/chat-participant.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5433),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'controlla_db'),
        entities: [User, UserRole, Tenant, Contractor, Project, Task, Subtask, Invite, InviteAudit, Chat, Message, ChatParticipant],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    TenantsModule,
    UsersModule,
    ProjectsModule,
    ContractorsModule,
    AuthModule,
    TasksModule,
    InvitesModule,
    ChatsModule,
  ],
})
export class AppModule {}
