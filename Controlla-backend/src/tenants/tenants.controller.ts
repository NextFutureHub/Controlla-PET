import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, TenantRegistrationResponseDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Tenant } from './entities/tenant.entity';

@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new tenant with admin user' })
  @ApiResponse({ 
    status: 201, 
    description: 'The tenant has been successfully created with admin user and tokens.',
    type: TenantRegistrationResponseDto
  })
  register(@Body() createTenantDto: CreateTenantDto): Promise<TenantRegistrationResponseDto> {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tenants' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all tenants.',
    type: [Tenant]
  })
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tenant by id' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return the tenant.',
    type: Tenant
  })
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tenant' })
  @ApiResponse({ 
    status: 200, 
    description: 'The tenant has been successfully updated.',
    type: Tenant
  })
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tenant' })
  @ApiResponse({ 
    status: 200, 
    description: 'The tenant has been successfully deleted.'
  })
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
} 