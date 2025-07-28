import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';
import { ChatParticipant } from './chat-participant.entity';

export enum ChatType {
  PRIVATE = 'private',
  GROUP = 'group'
}

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ChatType,
    default: ChatType.PRIVATE
  })
  type: ChatType;

  @Column({ nullable: true })
  avatar?: string;

  @ManyToOne(() => Tenant, { nullable: false, onDelete: 'CASCADE' })
  tenant: Tenant;

  @ManyToOne(() => User, { nullable: false })
  createdBy: User;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Message, message => message.chat)
  messages: Message[];

  @OneToMany(() => ChatParticipant, participant => participant.chat)
  participants: ChatParticipant[];
} 