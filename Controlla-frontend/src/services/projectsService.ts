import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:3000/api';

export type ProjectStatus = 'active' | 'completed' | 'archived';
export type ProjectPriority = 'low' | 'medium' | 'high';

export interface Contractor {
  id: string;
  name: string;
  email: string;
  role: string;
  hourlyRate: number;
  status: string;
  avatar?: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  estimatedHours: number;
  loggedHours: number;
  weight: number;
  dueDate: string;
  projectId: string;
  subtasks: any[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  startDate: string;
  endDate?: string;
  dueDate: string;
  updatedAt: string;
  createdAt: string;
  budget?: number;
  totalHours?: number;
  assignedContractors?: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: string;
  }>;
}

export interface CreateProjectDto {
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  dueDate: string;
  totalHours?: number;
  budget: number;
  assignedContractors?: string[];
}

export interface CreateTaskDto {
  name: string;
  description: string;
  status?: string;
  priority?: string;
  progress?: number;
  estimatedHours: number;
  loggedHours?: number;
  weight?: number;
  dueDate: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  dueDate?: string;
  totalHours?: number;
  budget?: number;
  assignedContractors?: string[];
}

export interface PaginatedResponse<T> {
  projects: T[];
  total: number;
  page?: number;
  limit?: number;
  totalPages: number;
}

class ProjectsService {
  private getHeaders() {
    return {
      Authorization: `Bearer ${authService.getAccessToken()}`,
    };
  }

  async getAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Project>> {
    const response = await axios.get(`${API_URL}/projects`, {
      headers: this.getHeaders(),
      params: { page, limit },
    });
    return response.data;
  }

  async getById(id: string): Promise<Project> {
    const response = await axios.get(`${API_URL}/projects/${id}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async create(data: CreateProjectDto): Promise<Project> {
    const response = await axios.post(`${API_URL}/projects`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async createTask(projectId: string, data: CreateTaskDto): Promise<Task> {
    try {
      const formattedData = {
        ...data,
        dueDate: new Date(data.dueDate).toISOString(),
        projectId
      };
      
      const response = await axios.post(`${API_URL}/projects/${projectId}/tasks`, formattedData, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<Project>): Promise<Project> {
    const response = await axios.patch(`${API_URL}/projects/${id}`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${API_URL}/projects/${id}`, {
      headers: this.getHeaders(),
    });
  }

  async addContractors(projectId: string, contractorIds: string[]): Promise<Project> {
    const response = await axios.post(
      `${API_URL}/projects/${projectId}/contractors`,
      { contractorIds },
      {
        headers: this.getHeaders(),
      }
    );
    return response.data;
  }

  async removeContractor(projectId: string, contractorId: string): Promise<Project> {
    const response = await axios.delete(
      `${API_URL}/projects/${projectId}/contractors/${contractorId}`,
      {
        headers: this.getHeaders(),
      }
    );
    return response.data;
  }
}

export const projectsService = new ProjectsService();