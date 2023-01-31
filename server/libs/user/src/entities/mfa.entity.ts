import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// export enum RecipientType {
//   Email = 'email',
//   Sms = 'sms',
// }

// todo: delete expired
@Entity()
export class MultiFactorVerifyCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 6 })
  code: string;

  @Column({ length: 32 })
  token: string;

  @Column({ default: 0 })
  count: number;

  @Column()
  usage: string;

  // @Column({ type: 'simple-enum', enum: RecipientType })
  // recipientType: RecipientType;

  @Column({ default: '' })
  encryptedRecipient: string;

  @Column({ default: '' })
  hashedRecipient: string;

  @Column({ default: 0 })
  associatedId: number;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
