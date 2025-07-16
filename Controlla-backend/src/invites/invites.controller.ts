import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InviteCodeDto } from './dto/create-invite.dto';

@ApiTags('invites')
@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate invite code (for admins)' })
  @ApiResponse({ status: 201, description: 'Invite code generated successfully' })
  generateCode(@Body() dto: InviteCodeDto, @Request() req) {
    return this.invitesService.generateCodeInvite(dto, req.user);
  }

  @Post('accept-code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept invite by code (for users without tenant)' })
  @ApiResponse({ status: 200, description: 'Invite code accepted successfully' })
  acceptCode(@Body('code') code: string, @Request() req) {
    return this.invitesService.acceptCodeInvite(code, req.user);
  }

  @Get('tenant/:tenantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active invite codes for tenant (admin only)' })
  @ApiResponse({ status: 200, description: 'Return all active invite codes for tenant' })
  findActiveCodes(@Param('tenantId') tenantId: string, @Request() req) {
    return this.invitesService.getActiveCodesForTenant(tenantId, req.user);
  }
} 