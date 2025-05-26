import { apiService } from './apiService';

export type ProjectStatus = 'planning' | 'in-progress' | 'on-hold' | 'review' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Contractor {
  id: string;
  name: string;
  avatar: string;
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
  dueDate: string;
  weight: number;
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
  status: string;
  priority: string;
  progress: number;
  estimatedHours: number;
  loggedHours: number;
  dueDate: string;
  weight: number;
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

class ProjectsService {
  private readonly baseUrl = '/api/projects';

  async getAll(): Promise<Project[]> {
    return apiService.get<Project[]>(this.baseUrl);
  }

  async getById(id: string): Promise<Project> {
    return apiService.get<Project>(`${this.baseUrl}/${id}`);
  }

  async create(data: CreateProjectDto): Promise<Project> {
    try {
      // Преобразуем даты в ISO формат и форматируем данные
      const formattedData = {
        name: data.name,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: new Date(data.dueDate).toISOString(),
        totalHours: data.totalHours,
        budget: Number(data.budget),
        assignedContractors: data.assignedContractors || []
      };
      
      console.log('Formatted data:', formattedData); // Для отладки
      const project = await apiService.post<Project>(this.baseUrl, formattedData);

      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
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
}

export const projectsService = new ProjectsService(); 