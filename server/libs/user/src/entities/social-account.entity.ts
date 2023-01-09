import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class SocialAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  uid: string;

  @Column()
  token: string;

  @Column('simple-json')
  extraData: { [key: string]: any };

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.socialAccounts, {
    cascade: true,
    nullable: false,
  })
  user: User;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
