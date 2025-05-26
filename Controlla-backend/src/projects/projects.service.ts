import { Injectable, NotFoundException, InternalServerErrorException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus, ProjectPriority } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ContractorsService } from '../contractors/contractors.service';
import { Contractor } from '../contractors/entities/contractor.entity';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Contractor)
    private contractorsRepository: Repository<Contractor>,
    private contractorsService: ContractorsService,
  ) {}

  private calculateProjectTotalHours(project: Project): number {
    if (!project.tasks || project.tasks.length === 0) {
      return 0;
    }
    const total = project.tasks.reduce((sum, task) => {
      const hours = Number(task.estimatedHours) || 0;
      return sum + hours;
    }, 0);
    return Number(total.toFixed(2));
  }

  private async updateProjectTotalHours(project: Project): Promise<void> {
    try {
      project.totalHours = this.calculateProjectTotalHours(project);
      await this.projectsRepository.save(project);
    } catch (error) {
      this.logger.error(`Error updating project total hours: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error updating project total hours');
    }
  }

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    try {
      const { assignedContractors, ...projectData } = createProjectDto;
      
      const project = this.projectsRepository.create({
        ...projectData,
        dueDate: new Date(projectData.dueDate),
        totalHours: 0 // Изначально 0, будет обновлено при добавлении задач
      });
      
      if (assignedContractors && assignedContractors.length > 0) {
        try {
          const contractors = await Promise.all(
            assignedContractors.map(async (id) => {
              try {
                return await this.contractorsService.findOne(id);
              } catch (error) {
                this.logger.error(`Contractor with ID ${id} not found`);
                throw new BadRequestException(`Contractor with ID ${id} not found`);
              }
            })
          );
          project.assignedContractors = contractors;
        } catch (error) {
          if (error instanceof BadRequestException) {
            throw error;
          }
          throw new BadRequestException('Error assigning contractors to project');
        }
      }
      
      const savedProject = await this.projectsRepository.save(project);
      await this.updateProjectTotalHours(savedProject);
      return this.findOne(savedProject.id);
    } catch (error) {
      this.logger.error(`Error creating project: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error creating project');
    }
  }

  async findAll(): Promise<Project[]> {
    try {
      const projects = await this.projectsRepository.find({
        relations: ['assignedContractors', 'tasks'],
      });
      
      // Обновляем totalHours для каждого проекта
      for (const project of projects) {
        await this.updateProjectTotalHours(project);
      }
      
      return projects;
    } catch (error) {
      this.logger.error(`Error finding all projects: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error retrieving projects');
    }
  }

  async findOne(id: string): Promise<Project> {
    try {
      const project = await this.projectsRepository.findOne({
        where: { id },
        relations: ['assignedContractors', 'tasks'],
      });
      
      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
      
      await this.updateProjectTotalHours(project);
      return project;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding project ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error retrieving project');
    }
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    try {
      const { assignedContractors, dueDate, ...projectData } = updateProjectDto;
      const project = await this.findOne(id);
      
      Object.assign(project, projectData);
      
      if (dueDate) {
        project.dueDate = new Date(dueDate);
      }
      
      if (assignedContractors) {
        try {
          const contractors = await Promise.all(
            assignedContractors.map(async (id) => {
              try {
                return await this.contractorsService.findOne(id);
              } catch (error) {
                this.logger.error(`Contractor with ID ${id} not found`);
                throw new BadRequestException(`Contractor with ID ${id} not found`);
              }
            })
          );
          project.assignedContractors = contractors;
        } catch (error) {
          if (error instanceof BadRequestException) {
            throw error;
          }
          throw new BadRequestException('Error assigning contractors to project');
        }
      }
      
      const updatedProject = await this.projectsRepository.save(project);
      await this.updateProjectTotalHours(updatedProject);
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error updating project ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error updating project');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const project = await this.findOne(id);
      
      // Удаляем все связанные задачи
      if (project.tasks && project.tasks.length > 0) {
        await this.projectsRepository
          .createQueryBuilder()
          .relation(Project, 'tasks')
          .of(project)
          .remove(project.tasks);
      }
      
      // Удаляем проект
      await this.projectsRepository.remove(project);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error removing project ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error removing project');
    }
  }
}
