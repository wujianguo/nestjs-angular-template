import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Generated } from 'typeorm';

@Entity()
export class SignupToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 32 })
  token: string;

  @Column({ default: 0 })
  count: number;

  // @Column()
  // expireOn: Date;

  @Column('simple-json')
  extraData: { [key: string]: any };

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
