import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(private configService: ConfigService, private usersService: UsersService) {}

  async comparePassword(password1: string, password2: string) {
    return await bcrypt.compare(password1, password2);
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password) {
      if (await this.comparePassword(password, user.password)) {
        return user;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // const { password, ...result } = user;
      // return result;
    }
    return null;
  }
}
