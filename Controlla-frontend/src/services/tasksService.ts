import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:3000/api';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  projectId: string;
  assignedTo?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class TasksService {
  private getHeaders() {
    return {
      Authorization: `Bearer ${authService.getAccessToken()}`,
    };
  }

  async getAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Task>> {
    const response = await axios.get(`${API_URL}/tasks`, {
      headers: this.getHeaders(),
      params: { page, limit },
    });
    return response.data;
  }

  async getById(id: string): Promise<Task> {
    const response = await axios.get(`${API_URL}/tasks/${id}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async create(data: Partial<Task>): Promise<Task> {
    const response = await axios.post(`${API_URL}/tasks`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async update(id: string, data: Partial<Task>): Promise<Task> {
    const response = await axios.patch(`${API_URL}/tasks/${id}`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${API_URL}/tasks/${id}`, {
      headers: this.getHeaders(),
    });
  }

  async updateStatus(projectId: string, id: string, status: string): Promise<Task> {
    const response = await axios.patch(`${API_URL}/projects/${projectId}/tasks/${id}/status`, { status });
    return response.data;
  }

  async logHours(projectId: string, id: string, hours: number): Promise<Task> {
    const response = await axios.post(`${API_URL}/projects/${projectId}/tasks/${id}/log-hours`, { hours });
    return response.data;
  }
}

export const tasksService = new TasksService(); 