import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Invite } from './invite.entity';
import { User } from '../../users/entities/user.entity';

export enum InviteAuditAction {
  CREATED = 'created',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  DELETED = 'deleted',
  RESENT = 'resent'
}

@Entity('invite_audits')
export class InviteAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  inviteId: string;

  @Column({
    type: 'enum',
    enum: InviteAuditAction
  })
  action: InviteAuditAction;

  @Column({ nullable: true })
  performedBy?: string; // userId who performed the action

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne(() => Invite, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inviteId' })
  invite: Invite;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'performedBy' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
} 