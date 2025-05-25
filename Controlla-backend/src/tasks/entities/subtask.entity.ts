import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Task } from './task.entity';

export enum SubtaskStatus {
  NOT_STARTED = 'not-started',
  IN_PROGRESS = 'in-progress',
  BLOCKED = 'blocked',
  COMPLETED = 'completed'
}

@Entity('subtask')
export class Subtask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: SubtaskStatus,
    default: SubtaskStatus.NOT_STARTED
  })
  status: SubtaskStatus;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  progress: number;

  @Column('decimal', { precision: 10, scale: 2 })
  estimatedHours: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  loggedHours: number;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @ManyToOne(() => Task, task => task.subtasks)
  task: Task;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 