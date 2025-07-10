import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Contractor } from '../../contractors/entities/contractor.entity';
import { User } from '../../users/entities/user.entity';

export enum ProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE
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

  @ManyToOne(() => User)
  manager: User;

  @ManyToOne(() => Tenant, tenant => tenant.projects)
  tenant: Tenant;

  @ManyToMany(() => Contractor, contractor => contractor.projects)
  @JoinTable({
    name: 'contractor_projects',
    joinColumn: {
      name: 'project_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'contractor_id',
      referencedColumnName: 'id'
    }
  })
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
