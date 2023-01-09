import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class LoginRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userAgent: string;

  @Column()
  token: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.loginRecords, {
    cascade: true,
    nullable: false,
  })
  user: User;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
