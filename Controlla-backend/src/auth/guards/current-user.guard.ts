import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class CurrentUserGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    if (request.user && request.user.id) {
      try {
        // Загружаем полные данные пользователя с tenant
        const fullUser = await this.usersRepository.findOne({
          where: { id: request.user.id },
          relations: ['tenant'],
        });
        
        if (fullUser) {
          request.user = fullUser;
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }
    
    return true;
  }
} 