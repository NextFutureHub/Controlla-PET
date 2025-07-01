import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('invites')
@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new invite (public endpoint)' })
  @ApiResponse({ status: 201, description: 'Invite created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 409, description: 'Invite already exists' })
  create(@Body() createInviteDto: CreateInviteDto) {
    // user = null для публичного вызова
    return this.invitesService.create(createInviteDto, null);
  }

  @Post('accept')
  @ApiOperation({ summary: 'Accept invite (public endpoint)' })
  @ApiResponse({ status: 200, description: 'Invite accepted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Invalid invite code' })
  accept(@Body() acceptInviteDto: AcceptInviteDto) {
    return this.invitesService.accept(acceptInviteDto);
  }

  @Get('tenant/:tenantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.PROJECT_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invites by tenant (requires ProjectManager+ role)' })
  @ApiResponse({ status: 200, description: 'Return all invites for tenant' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  findByTenant(@Param('tenantId') tenantId: string, @Request() req) {
    return this.invitesService.findByTenant(tenantId, req.user);
  }

  @Get('email/:email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invites by email (requires authentication)' })
  @ApiResponse({ status: 200, description: 'Return all invites for email' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByEmail(@Param('email') email: string, @Request() req) {
    return this.invitesService.findByEmail(email, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.PROJECT_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete invite (requires ProjectManager+ role)' })
  @ApiResponse({ status: 200, description: 'Invite deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  @ApiResponse({ status: 404, description: 'Invite not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.invitesService.remove(id, req.user);
  }

  @Post(':id/resend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.PROJECT_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend invite (requires ProjectManager+ role)' })
  @ApiResponse({ status: 200, description: 'Invite resent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  @ApiResponse({ status: 404, description: 'Invite not found' })
  resend(@Param('id') id: string, @Request() req) {
    return this.invitesService.resend(id, req.user);
  }

  @Get(':id/audit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.PROJECT_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invite audit log (requires ProjectManager+ role)' })
  @ApiResponse({ status: 200, description: 'Return invite audit log' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  @ApiResponse({ status: 404, description: 'Invite not found' })
  getAuditLog(@Param('id') id: string, @Request() req) {
    return this.invitesService.getAuditLog(id, req.user);
  }
} 