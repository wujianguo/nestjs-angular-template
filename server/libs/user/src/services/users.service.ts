import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SignupProfileDto } from '../dto/signup.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(profile: SignupProfileDto): Promise<User> {
    const entity = new User();
    entity.username = profile.username;
    entity.firstName = profile.firstName;
    entity.lastName = profile.lastName;
    if (profile.password) {
      entity.password = await bcrypt.hash(profile.password, 10);
    }
    const record = this.usersRepository.create(entity);
    const user = await this.usersRepository.save(record);
    return user;
  }

  async findOne(username: string): Promise<User> {
    return this.usersRepository.findOneByOrFail({ username });
  }
}
