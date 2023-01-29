import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class LoginRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  userAgent: string;

  @Column({ default: '' })
  ip: string;

  @Index({ unique: true })
  @Column()
  token: string;

  @ManyToOne(() => User, (user) => user.loginRecords, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
