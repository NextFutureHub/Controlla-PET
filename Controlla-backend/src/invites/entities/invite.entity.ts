import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { UserRole as UserRoleEnum } from '../../users/enums/user-role.enum';

@Entity('invites')
export class Invite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  tenantId: string;

  @Column({
    type: 'enum',
    enum: UserRoleEnum
  })
  role: UserRoleEnum;

  @Column({ unique: true })
  code: string;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  accepted: boolean;

  @Column({ nullable: true })
  acceptedBy?: string; // userId who accepted the invite

  @Column({ nullable: true })
  acceptedAt?: Date;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 