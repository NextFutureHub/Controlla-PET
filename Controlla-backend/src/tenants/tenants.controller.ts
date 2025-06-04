import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Tenant } from './entities/tenant.entity';

@ApiTags('tenants')
@ApiBearerAuth()
@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({ 
    status: 201, 
    description: 'The tenant has been successfully created.',
    type: Tenant
  })
  create(@Body() createTenantDto: CreateTenantDto, @Request() req) {
    return this.tenantsService.create(createTenantDto, req.user);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get all tenants' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all tenants.',
    type: [Tenant]
  })
  findAll(@Request() req) {
    return this.tenantsService.findAll(req.user);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get a tenant by id' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return the tenant.',
    type: Tenant
  })
  findOne(@Param('id') id: string, @Request() req) {
    return this.tenantsService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Update a tenant' })
  @ApiResponse({ 
    status: 200, 
    description: 'The tenant has been successfully updated.',
    type: Tenant
  })
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto, @Request() req) {
    return this.tenantsService.update(id, updateTenantDto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a tenant' })
  @ApiResponse({ 
    status: 200, 
    description: 'The tenant has been successfully deleted.'
  })
  remove(@Param('id') id: string, @Request() req) {
    return this.tenantsService.remove(id, req.user);
  }
} 