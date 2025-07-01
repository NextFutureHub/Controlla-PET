export enum UserRole {
  TENANT_ADMIN = 'tenant_admin',
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  VIEWER = 'viewer'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  tenantId?: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
  tenantId?: string;
} 