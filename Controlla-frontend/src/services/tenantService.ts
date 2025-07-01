import { apiService } from './apiService';
import { Tenant, CreateTenantDto, UpdateTenantDto } from '../types/tenant';
import { User } from '../types/user';
import { UserRole } from '../types/user';

const API_URL = 'http://localhost:3000/api';

export interface TenantRegistrationResponse {
  tenant: Tenant;
  access_token: string;
  refresh_token: string;
  user: User;
}

export const tenantService = {
  async register(data: CreateTenantDto): Promise<TenantRegistrationResponse> {
    try {
      const response = await apiService.post(`${API_URL}/tenants/register`, data);
      console.log('Raw server response:', response);
      if (!response) {
        throw new Error('No response from server');
      }
      return response;
    } catch (error) {
      console.error('Tenant registration error:', error);
      throw error;
    }
  },

  async create(data: CreateTenantDto): Promise<Tenant> {
    const response = await apiService.post(`${API_URL}/tenants`, data);
    return response.data;
  },

  async findAll(): Promise<Tenant[]> {
    const response = await apiService.get(`${API_URL}/tenants`);
    return response.data;
  },

  async findOne(id: string): Promise<Tenant> {
    const response = await apiService.get(`${API_URL}/tenants/${id}`);
    return response.data;
  },

  async update(id: string, data: UpdateTenantDto): Promise<Tenant> {
    const response = await apiService.patch(`${API_URL}/tenants/${id}`, data);
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await apiService.delete(`${API_URL}/tenants/${id}`);
  },

  async addUser(tenantId: string, user: User, role: UserRole = UserRole.VIEWER): Promise<User> {
    const response = await apiService.post(`${API_URL}/tenants/${tenantId}/users`, {
      ...user,
      role
    });
    return response.data;
  },

  async removeUser(tenantId: string, userId: string): Promise<void> {
    await apiService.delete(`${API_URL}/tenants/${tenantId}/users/${userId}`);
  }
}; 