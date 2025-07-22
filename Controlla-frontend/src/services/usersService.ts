import axios from 'axios';
import { apiService } from './apiService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const usersService = {
  async getAllByTenantId(tenantId: string) {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(`${API_URL}/users?tenantId=${tenantId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  async getCompanyMembers() {
    return await apiService.get('/users/by-tenant');
  }
}; 