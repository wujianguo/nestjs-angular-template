import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Not, Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { SecurityService } from './security.service';
import { LoginFailure, LoginRecord } from '../entities/login-record.entity';
import { ConfigService } from '@nestjs/config';
import { AdminAuthConfig } from '../dto/auth-config.dto';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly config: AdminAuthConfig;
  constructor(
    @InjectRepository(LoginRecord)
    private loginRecordRepository: Repository<LoginRecord>,
    @InjectRepository(LoginFailure)
    private loginFailureRepository: Repository<LoginFailure>,
    private configService: ConfigService,
    private securityService: SecurityService,
    private usersService: UsersService,
  ) {
    this.config = this.configService.get<AdminAuthConfig>('auth');
  }

  async validateLogin(login: string, password: string, userAgent: string, ip: string): Promise<User> {
    const limitCount = this.config.authLimitCount;
    const limitSeconds = this.config.authLimitTime;
    const expire = new Date(new Date().getTime() - limitSeconds * 1000);
    const failures = await this.loginFailureRepository.find({
      where: { login: login, createTime: MoreThan(expire) },
      order: { createTime: 'DESC' },
      take: limitCount,
    });
    if (failures.length >= limitCount) {
      this.logger.error(`validate(${login}) password wrong too many times`);
      // todo: set retry-after header
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
    const user = await this.usersService.findOne(login);
    return this.validateUser(user, password, userAgent, ip, login);
  }

  async validateUser(user: User, password: string, userAgent: string, ip: string, login = ''): Promise<User> {
    if (user && user.password) {
      if (await this.securityService.bcryptCompare(password, user.password)) {
        return user;
      }
    }
    // Security
    // Run the default password hasher once to reduce the timing difference between an existing and a nonexistent user.
    await this.securityService.bcryptCompare(password, '$2b$10$Rv7Cmx8EckOedSy/mnEZT.I1tDfcu2hytMCiBC/DqHm5z8W3O3KbG');

    const entity = new LoginFailure();
    entity.login = login || user.username;
    entity.userAgent = userAgent;
    entity.ip = ip;
    await this.loginFailureRepository.save(entity);
    throw new BadRequestException('username/email/phone or password is invalid');
  }

  async validateToken(token: string): Promise<LoginRecord | null> {
    return await this.loginRecordRepository.findOne({ where: { token }, relations: { user: true } });
  }

  async removeToken(token: LoginRecord): Promise<void> {
    this.loginRecordRepository.remove(token);
  }

  async removeAllToken(user: User): Promise<void> {
    this.loginRecordRepository.delete({ userId: user.id });
  }

  async removeTokensExcept(token: LoginRecord): Promise<void> {
    this.loginRecordRepository.delete({ userId: token.user.id, id: Not(token.id) });
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
