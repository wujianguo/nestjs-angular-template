import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class SignupToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 32 })
  token: string;

  @Column({ default: 0 })
  count: number;

  @Column('simple-json')
  extraData: { [key: string]: any };

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
