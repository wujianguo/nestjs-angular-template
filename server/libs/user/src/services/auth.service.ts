import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { SecurityService } from './security.service';
import { LoginRecord } from '../entities/login-record.entity';
import { ConfigService } from '@nestjs/config';
import { AdminAuthConfig } from '../dto/auth-config.dto';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly config: AdminAuthConfig;
  constructor(
    @InjectRepository(LoginRecord)
    private loginRecordRepository: Repository<LoginRecord>,
    private configService: ConfigService,
    private securityService: SecurityService,
    private usersService: UsersService,
  ) {
    this.config = this.configService.get<AdminAuthConfig>('auth');
  }

  async validateUser(login: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOne(login);
    if (user && user.password) {
      if (await this.securityService.bcryptCompare(password, user.password)) {
        return user;
      }
    }
    return null;
  }

  async validateToken(token: string): Promise<LoginRecord | null> {
    return await this.loginRecordRepository.findOne({ where: { token }, relations: { user: true } });
  }

  async removeToken(token: LoginRecord): Promise<void> {
    this.loginRecordRepository.remove(token);
  }

  async createToken(user: User, userAgent: string, ip: string): Promise<LoginRecord> {
    const entity = new LoginRecord();
    entity.user = user;
    entity.token = this.securityService.randomToken();
    entity.userAgent = userAgent;
    entity.ip = ip;
    const record = await this.loginRecordRepository.save(entity);
    const actives = await this.loginRecordRepository.find({
      where: { userId: user.id },
      order: { createTime: 'ASC' },
    });
    if (actives.length > this.config.deviceNumberLimit) {
      await this.loginRecordRepository.remove(actives.slice(0, actives.length - this.config.deviceNumberLimit));
    }
    return record;
  }
}
