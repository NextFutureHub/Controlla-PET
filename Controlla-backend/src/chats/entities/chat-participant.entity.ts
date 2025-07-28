import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '../../users/entities/user.entity';

export enum ParticipantRole {
  ADMIN = 'admin',
  MEMBER = 'member'
}

@Entity('chat_participants')
export class ChatParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Chat, { nullable: false, onDelete: 'CASCADE' })
  chat: Chat;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @Column({
    type: 'enum',
    enum: ParticipantRole,
    default: ParticipantRole.MEMBER
  })
  role: ParticipantRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  joinedAt?: Date;

  @Column({ nullable: true })
  leftAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 