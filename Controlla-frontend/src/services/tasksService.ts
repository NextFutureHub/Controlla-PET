import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface Task {
  id: string;
  name: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  estimatedHours: number;
  loggedHours: number;
  weight: number;
  dueDate: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  name: string;
  description: string;
  status?: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  estimatedHours: number;
  dueDate: string;
  projectId: string;
}

export interface UpdateTaskDto {
  name?: string;
  description?: string;
  status?: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  priority?: 'low' | 'medium' | 'high';
  estimatedHours?: number;
  loggedHours?: number;
  progress?: number;
  dueDate?: string;
  projectId: string;
}

class TasksService {
  async getAll(projectId: string): Promise<Task[]> {
    const response = await axios.get(`${API_URL}/projects/${projectId}/tasks`);
    return response.data;
  }

  async getById(projectId: string, id: string): Promise<Task> {
    const response = await axios.get(`${API_URL}/projects/${projectId}/tasks/${id}`);
    return response.data;
  }

  async create(data: CreateTaskDto): Promise<Task> {
    const response = await axios.post(`${API_URL}/projects/${data.projectId}/tasks`, data);
    return response.data;
  }

  async update(projectId: string, id: string, data: UpdateTaskDto): Promise<Task> {
    const response = await axios.patch(`${API_URL}/projects/${projectId}/tasks/${id}`, data);
    return response.data;
  }

  async delete(projectId: string, id: string): Promise<void> {
    const response = await axios.delete(`${API_URL}/projects/${projectId}/tasks/${id}`);
    await response;
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