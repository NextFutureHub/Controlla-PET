import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { UserRole } from '../../users/enums/user-role.enum'; 