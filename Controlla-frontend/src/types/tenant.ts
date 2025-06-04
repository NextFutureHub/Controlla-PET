import { User } from './user';
import { Project } from './project';
import { Contractor } from './contractor';

export interface Tenant {
  id: string;
  name: string;
  industry?: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  settings?: Record<string, any>;
  ownerId: string;
  users: User[];
  projects: Project[];
  contractors: Contractor[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantDto {
  name: string;
  industry?: string;
  description?: string;
  logo?: string;
  settings?: Record<string, any>;
}

export interface UpdateTenantDto extends Partial<CreateTenantDto> {} 