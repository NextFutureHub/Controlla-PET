export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  TENANT_ADMIN = 'tenant_admin',
  PROJECT_MANAGER = 'project_manager',
  CONTRACTOR_COMPANY = 'contractor_company',
  CONTRACTOR_EMPLOYEE = 'contractor_employee',
  FINANCIAL_MANAGER = 'financial_manager',
  CLIENT = 'client',
  GUEST = 'guest'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId?: string;
  contractorId?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
} 