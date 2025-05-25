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
  status?: string;
  priority?: string;
  progress?: number;
  estimatedHours: number;
  loggedHours?: number;
  weight?: number;
  dueDate: string;
  projectId: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {}

class TasksService {
  async getAll(): Promise<Task[]> {
    const response = await axios.get(`${API_URL}/tasks`);
    return response.data;
  }

  async getById(id: string): Promise<Task> {
    const response = await axios.get(`${API_URL}/tasks/${id}`);
    return response.data;
  }

  async create(data: CreateTaskDto): Promise<Task> {
    const response = await axios.post(`${API_URL}/tasks`, data);
    return response.data;
  }

  async update(id: string, data: UpdateTaskDto): Promise<Task> {
    const response = await axios.patch(`${API_URL}/tasks/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${API_URL}/tasks/${id}`);
  }

  async updateStatus(id: string, status: string): Promise<Task> {
    const response = await axios.patch(`${API_URL}/tasks/${id}/status`, { status });
    return response.data;
  }

  async logHours(id: string, hours: number): Promise<Task> {
    const response = await axios.post(`${API_URL}/tasks/${id}/log-hours`, { hours });
    return response.data;
  }
}

export const tasksService = new TasksService(); 