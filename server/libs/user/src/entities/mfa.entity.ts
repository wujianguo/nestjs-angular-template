import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum RecipientType {
  Email = 'email',
  Sms = 'sms',
}

@Entity()
export class MultiFactorVerifyCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column({ length: 32 })
  token: string;

  @Column({ default: 0 })
  count: number;

  @Column()
  usage: string;

  @Column({ type: 'simple-enum', enum: RecipientType })
  recipientType: RecipientType;

  @Column()
  recipient: string;

  @Column()
  hashedRecipient: string;

  // @Column()
  // expireOn: Date;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
