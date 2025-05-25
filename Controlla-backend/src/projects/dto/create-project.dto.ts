import { IsString, IsNotEmpty, IsEnum, IsDate, IsNumber, IsArray, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus, ProjectPriority } from '../entities/project.entity';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Название проекта',
    example: 'Website Redesign'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Описание проекта',
    example: 'Complete overhaul of company website with modern design and improved UX'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Статус проекта',
    example: 'in-progress',
    enum: ['in-progress', 'planning', 'completed']
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiProperty({
    description: 'Приоритет проекта',
    example: 'high',
    enum: ['high', 'medium', 'low']
  })
  @IsEnum(ProjectPriority)
  @IsOptional()
  priority?: ProjectPriority;

  @ApiProperty({
    description: 'Дата завершения проекта',
    example: '2025-07-11'
  })
  @IsDate()
  @IsNotEmpty()
  dueDate: Date;

  @ApiProperty({
    description: 'Прогресс проекта в процентах',
    example: 65,
    minimum: 0,
    maximum: 100
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;

  @ApiProperty({
    description: 'Общее количество часов',
    example: 245
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalHours?: number;

  @ApiProperty({
    description: 'Бюджет проекта',
    example: 15000
  })
  @IsNumber()
  @Min(0)
  budget: number;

  @ApiProperty({
    description: 'Потраченная сумма',
    example: 9750
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  spent?: number;

  @ApiProperty({
    description: 'ID назначенных подрядчиков',
    example: ['1', '2', '3']
  })
  @IsArray()
  @IsOptional()
  assignedContractors?: string[];
}
