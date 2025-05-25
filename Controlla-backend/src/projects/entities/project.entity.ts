import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Contractor } from '../../contractors/entities/contractor.entity';
import { Task } from '../../tasks/entities/task.entity';

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in-progress',
  ON_HOLD = 'on-hold',
  REVIEW = 'review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

@Entity('project')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING
  })
  status: ProjectStatus;

  @Column({
    type: 'enum',
    enum: ProjectPriority,
    default: ProjectPriority.MEDIUM
  })
  priority: ProjectPriority;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  progress: number;

  @ManyToMany(() => Contractor)
  @JoinTable()
  assignedContractors: Contractor[];

  @OneToMany(() => Task, task => task.project)
  tasks: Task[];

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalHours: number;

  @Column('decimal', { precision: 10, scale: 2 })
  budget: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  spent: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  calculateProgress(): number {
    if (!this.tasks || this.tasks.length === 0) {
      return 0;
    }

    // Если у задач нет весов, считаем среднее арифметическое
    const hasWeights = this.tasks.some(task => task.weight && task.weight > 0);
    if (!hasWeights) {
      const totalProgress = this.tasks.reduce((sum, task) => sum + (task.progress || 0), 0);
      return Math.round(totalProgress / this.tasks.length);
    }

    // Если есть веса, считаем взвешенное среднее
    const totalWeight = this.tasks.reduce((sum, task) => sum + (task.weight || 0), 0);
    if (totalWeight === 0) return 0;

    const weightedProgress = this.tasks.reduce((sum, task) => {
      const weight = task.weight || 0;
      const progress = task.progress || 0;
      return sum + weight * progress;
    }, 0);

    return Math.round((weightedProgress / totalWeight) * 100);
  }
}
