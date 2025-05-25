import { apiService } from './apiService';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'in-progress' | 'planning' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  progress: number;
  assignedContractors: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  totalHours: number;
  budget: number;
  spent: number;
}

export interface CreateProjectDto {
  name: string;
  description: string;
  status: 'in-progress' | 'planning' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  progress: number;
  assignedContractors: string[];
  totalHours: number;
  budget: number;
  spent: number;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}

class ProjectsService {
  private readonly baseUrl = '/projects';

  async getAll(): Promise<Project[]> {
    return apiService.get<Project[]>(this.baseUrl);
  }

  async getById(id: string): Promise<Project> {
    return apiService.get<Project>(`${this.baseUrl}/${id}`);
  }

  async create(data: CreateProjectDto): Promise<Project> {
    return apiService.post<Project>(this.baseUrl, data);
  }

  async update(id: string, data: UpdateProjectDto): Promise<Project> {
    return apiService.patch<Project>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiService.delete(`${this.baseUrl}/${id}`);
  }
}

export const projectsService = new ProjectsService(); 