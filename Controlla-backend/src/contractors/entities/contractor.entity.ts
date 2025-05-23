import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

export enum ContractorRole {
  DEVELOPER = 'developer',
  DESIGNER = 'designer',
  MANAGER = 'manager',
  QA = 'qa',
  OTHER = 'other'
}

export enum ContractorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OFFLINE = 'offline'
}

@Entity('contractor')
export class Contractor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: ContractorRole,
    default: ContractorRole.OTHER
  })
  role: ContractorRole;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  hourlyRate: number;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({
    type: 'enum',
    enum: ContractorStatus,
    default: ContractorStatus.ACTIVE
  })
  status: ContractorStatus;

  @Column({ nullable: true })
  location: string;

  @ManyToMany(() => Project, project => project.assignedContractors)
  @JoinTable({
    name: 'contractor_projects',
    joinColumn: {
      name: 'contractor_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'project_id',
      referencedColumnName: 'id'
    }
  })
  projects: Project[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}