import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { CurrentUserGuard } from '../auth/guards/current-user.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole])],
  controllers: [UsersController],
  providers: [UsersService, CurrentUserGuard],
  exports: [UsersService]
})
export class UsersModule {} 