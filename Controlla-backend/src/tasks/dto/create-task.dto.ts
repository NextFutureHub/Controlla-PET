import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({ description: 'Task name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Task description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Task status', enum: TaskStatus, default: TaskStatus.NOT_STARTED })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'Task priority', enum: TaskPriority, default: TaskPriority.MEDIUM })
  @IsString()
  @IsOptional()
  priority?: string;

  @ApiProperty({ description: 'Task progress', default: 0 })
  @IsNumber()
  @IsOptional()
  progress?: number;

  @ApiProperty({ description: 'Estimated hours to complete the task' })
  @IsNumber()
  estimatedHours: number;

  @ApiProperty({ description: 'Logged hours', default: 0 })
  @IsNumber()
  @IsOptional()
  loggedHours?: number;

  @ApiProperty({ description: 'Task weight', default: 1 })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({ description: 'Task due date' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ description: 'Project ID' })
  @IsString()
  projectId: string;
} 