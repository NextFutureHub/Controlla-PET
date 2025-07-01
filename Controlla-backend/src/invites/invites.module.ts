import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitesService } from './invites.service';
import { InvitesController } from './invites.controller';
import { Invite } from './entities/invite.entity';
import { InviteAudit } from './entities/invite-audit.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invite, InviteAudit, UserRole, User, Tenant])
  ],
  controllers: [InvitesController],
  providers: [InvitesService],
  exports: [InvitesService]
})
export class InvitesModule {} 