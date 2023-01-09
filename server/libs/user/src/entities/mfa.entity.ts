import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Generated } from 'typeorm';

export enum RecipientType {
  Email = 'email',
  Phone = 'phone',
}

@Entity()
export class MultiFactorVerifyCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  @Generated('uuid')
  token: string;

  @Column()
  usage: string;

  @Column({ type: 'simple-enum', enum: RecipientType })
  recipientType: RecipientType;

  @Column()
  recipient: string;

  @Column()
  expireOn: Date;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
