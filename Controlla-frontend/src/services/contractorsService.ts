import { apiService } from './apiService';
import { ContractorStatus, ContractorRole } from '../types/contractor';
import { Project } from './projectsService';

const API_URL = 'http://localhost:3000/api';

export interface Contractor {
  id: string;
  name: string;
  email: string;
  role: ContractorRole;
  hourlyRate: number;
  rating: number;
  status: ContractorStatus;
  location?: string;
  avatar?: string;
  projects?: Project[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractorDto {
  name: string;
  email: string;
  role: string;
  hourlyRate: number;
  location?: string;
  status?: ContractorStatus;
  avatar?: File;
}

export interface UpdateContractorDto {
  name?: string;
  email?: string;
  role?: string;
  hourlyRate?: number;
  location?: string;
  status?: ContractorStatus;
  avatar?: File;
}

export interface PaginatedResponse<T> {
  contractors: T[];
  total: number;
  totalPages: number;
}

export class ContractorsService {
  private baseUrl = '/api/contractors';

  async getAll(page = 1, limit = 10): Promise<PaginatedResponse<Contractor>> {
    return apiService.get<PaginatedResponse<Contractor>>(this.baseUrl, { page, limit });
  }

  async getById(id: string): Promise<Contractor> {
    const contractor = await apiService.get<Contractor>(`${this.baseUrl}/${id}`);
    return {
      ...contractor,
      avatar: contractor.avatar ? `${API_URL}${contractor.avatar}` : undefined
    };
  }

  async create(data: CreateContractorDto): Promise<Contractor> {
    if (data.avatar) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'avatar' && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      const contractor = await apiService.post<Contractor>(this.baseUrl, formData);
      return {
        ...contractor,
        avatar: contractor.avatar ? `${API_URL}${contractor.avatar}` : undefined
      };
    }
    const contractor = await apiService.post<Contractor>(this.baseUrl, data);
    return {
      ...contractor,
      avatar: contractor.avatar ? `${API_URL}${contractor.avatar}` : undefined
    };
  }

  async update(id: string, data: UpdateContractorDto): Promise<Contractor> {
    if (data.avatar) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'avatar' && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      const contractor = await apiService.patch<Contractor>(`${this.baseUrl}/${id}`, formData);
      return {
        ...contractor,
        avatar: contractor.avatar ? `${API_URL}${contractor.avatar}` : undefined
      };
    }
    const contractor = await apiService.patch<Contractor>(`${this.baseUrl}/${id}`, data);
    return {
      ...contractor,
      avatar: contractor.avatar ? `${API_URL}${contractor.avatar}` : undefined
    };
  }

  async delete(id: string): Promise<void> {
    return apiService.delete(`${this.baseUrl}/${id}`);
  }

  async updateStatus(id: string, status: ContractorStatus): Promise<Contractor> {
    const contractor = await apiService.patch<Contractor>(`${this.baseUrl}/${id}/status`, { status });
    return {
      ...contractor,
      avatar: contractor.avatar ? `${API_URL}${contractor.avatar}` : undefined
    };
  }

  async updateRating(id: string, rating: number): Promise<Contractor> {
    const contractor = await apiService.patch<Contractor>(`${this.baseUrl}/${id}/rating`, { rating });
    return {
      ...contractor,
      avatar: contractor.avatar ? `${API_URL}${contractor.avatar}` : undefined
    };
  }
}

export const contractorsService = new ContractorsService(); 