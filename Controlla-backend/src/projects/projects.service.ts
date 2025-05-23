import { Injectable, NotFoundException, InternalServerErrorException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ContractorsService } from '../contractors/contractors.service';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    private contractorsService: ContractorsService,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    try {
      const { assignedContractors, ...projectData } = createProjectDto;
      
      const project = this.projectsRepository.create({
        ...projectData,
        dueDate: new Date(projectData.dueDate)
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
      
      return await this.projectsRepository.save(project);
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
      return await this.projectsRepository.find({
        relations: ['assignedContractors'],
      });
    } catch (error) {
      this.logger.error(`Error finding all projects: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error retrieving projects');
    }
  }

  async findOne(id: string): Promise<Project> {
    try {
      const project = await this.projectsRepository.findOne({
        where: { id },
        relations: ['assignedContractors'],
      });
      
      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
      
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
      
      return await this.projectsRepository.save(project);
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
      const result = await this.projectsRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error removing project ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error removing project');
    }
  }
}
