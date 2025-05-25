import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus, TaskPriority } from './entities/task.entity';
import { Subtask, SubtaskStatus } from './entities/subtask.entity';
import { ProjectsService } from '../projects/projects.service';

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

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(Subtask)
    private subtasksRepository: Repository<Subtask>,
    private projectsService: ProjectsService,
  ) {}

  private calculateTaskProgress(task: Task): number {
    if (!task.subtasks || task.subtasks.length === 0) {
      // Если нет подзадач, прогресс зависит от статуса
      switch (task.status) {
        case TaskStatus.NOT_STARTED:
          return 0;
        case TaskStatus.BLOCKED:
          return 0;
        case TaskStatus.COMPLETED:
          return 100;
        case TaskStatus.IN_PROGRESS:
          // Если есть залогированные часы, считаем прогресс по ним
          if (task.loggedHours > 0 && task.estimatedHours > 0) {
            return Math.min(Math.round((task.loggedHours / task.estimatedHours) * 100), 99);
          }
          return task.progress; // Используем установленный вручную прогресс
      }
    }

    // Если есть подзадачи, считаем средний прогресс по ним
    const subtaskProgress = task.subtasks.reduce((sum, subtask) => {
      switch (subtask.status) {
        case SubtaskStatus.NOT_STARTED:
          return sum;
        case SubtaskStatus.BLOCKED:
          return sum;
        case SubtaskStatus.COMPLETED:
          return sum + 100;
        case SubtaskStatus.IN_PROGRESS:
          if (subtask.loggedHours > 0 && subtask.estimatedHours > 0) {
            return sum + Math.min(Math.round((subtask.loggedHours / subtask.estimatedHours) * 100), 99);
          }
          return sum + subtask.progress;
      }
    }, 0);

    return Math.round(subtaskProgress / task.subtasks.length);
  }

  private async updateProjectProgress(projectId: string): Promise<void> {
    const project = await this.projectsService.findOne(projectId);
    if (project) {
      project.progress = project.calculateProgress();
      await this.projectsService.update(projectId, { progress: project.progress });
    }
  }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    try {
      const task = this.tasksRepository.create({
        ...createTaskDto,
        status: createTaskDto.status as TaskStatus || TaskStatus.NOT_STARTED,
        priority: createTaskDto.priority as TaskPriority || TaskPriority.MEDIUM,
        dueDate: new Date(createTaskDto.dueDate),
        project: { id: createTaskDto.projectId }
      });
      const savedTask = await this.tasksRepository.save(task);
      await this.updateProjectProgress(createTaskDto.projectId);
      return this.findOne(savedTask.id);
    } catch (error) {
      this.logger.error(`Error creating task: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error creating task');
    }
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    try {
      const task = await this.findOne(id);
      const projectId = task.project.id;
      
      Object.assign(task, {
        ...updateTaskDto,
        status: updateTaskDto.status as TaskStatus || task.status,
        priority: updateTaskDto.priority as TaskPriority || task.priority,
        dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : task.dueDate,
        project: updateTaskDto.projectId ? { id: updateTaskDto.projectId } : task.project
      });
      
      // Пересчитываем прогресс задачи
      task.progress = this.calculateTaskProgress(task);
      
      await this.tasksRepository.save(task);
      await this.updateProjectProgress(projectId);
      
      if (updateTaskDto.projectId && updateTaskDto.projectId !== projectId) {
        await this.updateProjectProgress(updateTaskDto.projectId);
      }
      
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating task ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error updating task');
    }
  }

  async updateStatus(id: string, status: string): Promise<Task> {
    const task = await this.findOne(id);
    const projectId = task.project.id;
    
    task.status = status as TaskStatus;
    
    // Обновляем прогресс в зависимости от статуса
    if (status === TaskStatus.COMPLETED) {
      task.progress = 100;
    } else if (status === TaskStatus.NOT_STARTED || status === TaskStatus.BLOCKED) {
      task.progress = 0;
    }
    
    await this.tasksRepository.save(task);
    await this.updateProjectProgress(projectId);
    
    return this.findOne(id);
  }

  async logHours(id: string, hours: number): Promise<Task> {
    const task = await this.findOne(id);
    const projectId = task.project.id;
    
    task.loggedHours += hours;
    
    // Пересчитываем прогресс с учетом залогированных часов
    task.progress = this.calculateTaskProgress(task);
    
    await this.tasksRepository.save(task);
    await this.updateProjectProgress(projectId);
    
    return this.findOne(id);
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['subtasks', 'project'],
    });
    
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    
    return task;
  }

  async findAll(): Promise<Task[]> {
    return this.tasksRepository.find({
      relations: ['subtasks', 'project'],
    });
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { project: { id: projectId } },
      relations: ['subtasks', 'project'],
    });
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    const projectId = task.project.id;
    
    await this.tasksRepository.remove(task);
    await this.updateProjectProgress(projectId);
  }
} 