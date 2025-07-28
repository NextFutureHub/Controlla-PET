import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '../../users/entities/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @ManyToOne(() => Chat, { nullable: false, onDelete: 'CASCADE' })
  chat: Chat;

  @ManyToOne(() => User, { nullable: false })
  author: User;

  @Column({ default: false })
  isEdited: boolean;

  @Column({ nullable: true })
  editedAt?: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ nullable: true })
  deletedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 