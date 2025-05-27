import { apiService } from './apiService';

export type ProjectStatus = 'planning' | 'in-progress' | 'on-hold' | 'review' | 'completed' | 'cancelled';
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
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  dueDate: string;
  totalHours: number;
  budget: number;
  assignedContractors: Contractor[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
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
  totalPages: number;
}

export class ProjectsService {
  private baseUrl = '/api/projects';

  async getAll(page = 1, limit = 3): Promise<PaginatedResponse<Project>> {
    return apiService.get<PaginatedResponse<Project>>(this.baseUrl, { page, limit });
  }

  async getById(id: string): Promise<Project> {
    return apiService.get<Project>(`${this.baseUrl}/${id}`);
  }

  async create(data: CreateProjectDto): Promise<Project> {
    return apiService.post<Project>(this.baseUrl, data);
  }

  async createTask(projectId: string, data: CreateTaskDto): Promise<Task> {
    try {
      const formattedData = {
        ...data,
        dueDate: new Date(data.dueDate).toISOString(),
        projectId
      };
      
      return await apiService.post<Task>(`${this.baseUrl}/${projectId}/tasks`, formattedData);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async update(id: string, data: UpdateProjectDto): Promise<Project> {
    return apiService.patch<Project>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiService.delete(`${this.baseUrl}/${id}`);
  }

  async addContractors(projectId: string, contractorIds: string[]): Promise<Project> {
    return apiService.patch<Project>(`${this.baseUrl}/${projectId}`, {
      assignedContractors: contractorIds
    });
  }

  async removeContractor(projectId: string, contractorId: string): Promise<Project> {
    const project = await this.getById(projectId);
    const updatedContractors = project.assignedContractors
      .filter(contractor => contractor.id !== contractorId)
      .map(contractor => contractor.id);
    
    return this.update(projectId, {
      assignedContractors: updatedContractors
    });
  }
}

export const projectsService = new ProjectsService();