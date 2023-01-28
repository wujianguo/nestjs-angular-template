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

// todo: add index
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  iv: string;

  @Column({ default: '' })
  desensitizedEmail: string;

  @Column({ default: '' })
  desensitizedPhoneNumber: string;

  @Column({ default: '' })
  hashedEmail: string;

  @Column({ default: '' })
  hashedPhoneNumber: string;

  @Column({ default: '' })
  encryptedEmail: string;

  @Column({ default: '' })
  encryptedPhoneNumber: string;

  @Column({ default: '' })
  password: string;

  @Column({ default: '' })
  avatar: string;

  @Column({ default: '' })
  firstName: string;

  @Column({ default: '' })
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
