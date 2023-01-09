import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { LoginRecord } from './login-record.entity';
import { SocialAccount } from './social-account.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  // @Column({ unique: true })
  email: string;

  // @Column({ unique: true })
  phone: string;

  @Column()
  password: string;

  @Column()
  avatar: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @OneToMany(() => LoginRecord, (loginRecord) => loginRecord.user)
  loginRecords: LoginRecord[];

  @OneToMany(() => SocialAccount, (socialAccount) => socialAccount.user)
  socialAccounts: SocialAccount[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @DeleteDateColumn()
  deleteTime: Date;
}
