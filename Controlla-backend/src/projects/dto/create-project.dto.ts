import { IsString, IsNumber, IsDateString, IsArray, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Название проекта',
    example: 'Website Redesign'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Описание проекта',
    example: 'Complete overhaul of company website with modern design and improved UX'
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Статус проекта',
    example: 'in-progress',
    enum: ['in-progress', 'planning', 'completed']
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'Приоритет проекта',
    example: 'high',
    enum: ['high', 'medium', 'low']
  })
  @IsString()
  priority: string;

  @ApiProperty({
    description: 'Дата завершения проекта',
    example: '2025-07-11'
  })
  @IsDateString()
  dueDate: string;

  @ApiProperty({
    description: 'Прогресс проекта в процентах',
    example: 65,
    minimum: 0,
    maximum: 100
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @ApiProperty({
    description: 'Общее количество часов',
    example: 245
  })
  @IsNumber()
  totalHours: number;

  @ApiProperty({
    description: 'Бюджет проекта',
    example: 15000
  })
  @IsNumber()
  budget: number;

  @ApiProperty({
    description: 'Потраченная сумма',
    example: 9750
  })
  @IsNumber()
  spent: number;

  @ApiProperty({
    description: 'ID назначенных подрядчиков',
    example: ['1', '2'],
    type: [String]
  })
  @IsArray()
  assignedContractors: string[];
}
