import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { Subtask } from './subtask.entity';

export enum TaskStatus {
  NOT_STARTED = 'not-started',
  IN_PROGRESS = 'in-progress',
  BLOCKED = 'blocked',
  COMPLETED = 'completed'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

@Entity('task')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.NOT_STARTED
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM
  })
  priority: TaskPriority;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  progress: number;

  @Column('decimal', { precision: 10, scale: 2 })
  estimatedHours: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  loggedHours: number;

  @Column('decimal', { precision: 5, scale: 2, default: 1 })
  weight: number;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @ManyToOne(() => Project, project => project.tasks)
  project: Project;

  @OneToMany(() => Subtask, subtask => subtask.task)
  subtasks: Subtask[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 