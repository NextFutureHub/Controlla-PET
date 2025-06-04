import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

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

@Entity('contractors')
export class Contractor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ unique: true })
  email: string;

  @Column('simple-array')
  skills: string[];

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating: number;

  @ManyToOne(() => Tenant, tenant => tenant.contractors)
  tenant: Tenant;

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