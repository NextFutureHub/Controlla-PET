import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { UserRole } from '../enums/user-role.enum'; 