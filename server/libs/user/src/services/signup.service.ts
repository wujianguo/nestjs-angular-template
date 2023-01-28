import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { MoreThan, Repository } from 'typeorm';
import { EmailService, SmsService } from '@app/message';
import { MultiFactorVerifyCode, RecipientType } from '../entities/mfa.entity';
import { AdminAuthConfig } from '../dto/auth-config.dto';
import { SignupToken } from '../entities/signup.entity';
import { SignupProfileDto } from '../dto/signup.dto';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { SecurityService } from './security.service';

@Injectable()
export class SignupService {
  private readonly logger = new Logger(SignupService.name);
  private readonly config: AdminAuthConfig;

  constructor(
    @InjectRepository(MultiFactorVerifyCode) private codeRepository: Repository<MultiFactorVerifyCode>,
    @InjectRepository(SignupToken) private signupTokenRepository: Repository<SignupToken>,
    private emailService: EmailService,
    private smsService: SmsService,
    private configService: ConfigService,
    private usersService: UsersService,
    private securityService: SecurityService,
  ) {
    this.config = this.configService.get<AdminAuthConfig>('auth');
  }

  private async signupSend(code: string, recipient: string, recipientType: RecipientType): Promise<string> {
    const entity = new MultiFactorVerifyCode();
    entity.token = this.securityService.randomToken(this.securityService.tokenSize);
    entity.code = await this.securityService.bcryptHash(code);
    entity.recipientType = recipientType;
    entity.hashedRecipient = this.securityService.hmac(recipient);
    const iv = this.securityService.randomBytes();
    entity.recipient = (await this.securityService.encrypt(recipient, code, iv)) + '.' + iv.toString('hex');
    entity.usage = 'signup';
    const record = this.codeRepository.create(entity);
    const resp = await this.codeRepository.save(record);
    return resp.token;
  }

  private async recipientExists(recipient: string): Promise<boolean> {
    const expire = new Date(new Date().getTime() - this.config.sendLimitTime * 1000);
    const hashedRecipient = this.securityService.hmac(recipient);
    return this.codeRepository.exist({ where: { hashedRecipient, createTime: MoreThan(expire) } });
  }

  private async checkRecipientExists(recipient: string): Promise<void> {
    const exist = await this.recipientExists(recipient);
    if (exist) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  async signupEmailSend(email: string): Promise<string> {
    await this.checkRecipientExists(email);
    const code = this.securityService.randomCode(this.securityService.codeSize);
    await this.emailService.send('Sign up', `Hello: your code: [${code}]`, [email]);
    return this.signupSend(code, email, RecipientType.Email);
  }

  async signupSmsSend(phoneNumber: string): Promise<string> {
    await this.checkRecipientExists(phoneNumber);
    const code = this.securityService.randomCode(this.securityService.codeSize);
    await this.smsService.send(`Hello: your code: [${code}]`, [phoneNumber]);
    return this.signupSend(code, phoneNumber, RecipientType.Sms);
  }

  async signupVerify(token: string, code: string): Promise<string> {
    const usage = 'signup';
    const expire = new Date(new Date().getTime() - this.config.codeExpireTime * 1000);
    const codeObject = await this.codeRepository.findOneBy({ token, usage, createTime: MoreThan(expire) });
    if (!codeObject) {
      this.logger.error(`invalid token(${token}) or expire`);
      throw new BadRequestException('Invalid token.');
    }
    if (codeObject.count >= this.config.codeVerifyMaxCount) {
      this.logger.error('You have tried too many times.');
      throw new BadRequestException('You have tried too many times (maximum 3).');
    }
    const result = await this.securityService.bcryptCompare(code, codeObject.code);
    if (!result) {
      this.logger.error(`invalid code(${code})`);
      await this.codeRepository.increment({ id: codeObject.id }, 'count', 1);
      const count = codeObject.count + 1;
      if (count === 1) {
        throw new BadRequestException(
          `Invalid code, you have entered it 1 time (maximum ${this.config.codeVerifyMaxCount} times).`,
        );
      } else if (count === 2) {
        throw new BadRequestException(
          `Invalid code, you have entered it twice (maximum ${this.config.codeVerifyMaxCount} times).`,
        );
      } else if (count === this.config.codeVerifyMaxCount) {
        throw new BadRequestException(
          `Invalid code, you have entered ${count} times (maximum ${this.config.codeVerifyMaxCount} times). Please send an email again.`,
        );
      } else {
        throw new BadRequestException(
          `Invalid code, you have entered it ${count} times (maximum ${this.config.codeVerifyMaxCount} times).`,
        );
      }
    }

    let recipient = '';
    if (codeObject.recipient) {
      const str: string = codeObject.recipient;
      const iv = Buffer.from(str.split('.')[1], 'hex');
      recipient = await this.securityService.decrypt(str.split('.')[0], code, iv);
    }
    if (codeObject.recipientType == RecipientType.Email.toString()) {
      const exist = await this.usersService.exists(recipient);
      if (exist) {
        throw this.usersService.emailExistsException();
      }
    } else if (codeObject.recipientType == RecipientType.Sms.toString()) {
      const exist = await this.usersService.exists(recipient);
      if (exist) {
        throw this.usersService.phoneNumberExistsException();
      }
    }

    const entity = new SignupToken();
    entity.token = this.securityService.randomToken(this.securityService.tokenSize);
    entity.extraData = {
      recipientType: codeObject.recipientType.toString(),
      recipient: codeObject.recipient,
    };
    const record = this.signupTokenRepository.create(entity);
    const resp = await this.signupTokenRepository.save(record);
    await this.codeRepository.remove(codeObject);
    return resp.token + code + this.securityService.hmac(code);
  }

  async signupComplete(token: string, profile: SignupProfileDto): Promise<User> {
    const expire = new Date(new Date().getTime() - this.config.codeExpireTime * 1000);
    const realToken = token.substring(0, this.securityService.tokenSize);
    const hmacStart = this.securityService.tokenSize + this.securityService.codeSize;
    const code = token.substring(this.securityService.tokenSize, hmacStart);
    const signup = await this.signupTokenRepository.findOneBy({ token: realToken, createTime: MoreThan(expire) });
    if (!signup) {
      this.logger.error(`invalid token(${realToken})`);
      throw new BadRequestException('Invalid token');
    }
    if (signup.count >= this.config.codeVerifyMaxCount) {
      this.logger.error('max times');
      throw new BadRequestException('Invalid token');
    }
    if (!this.securityService.verifyHmac(code, token.substring(hmacStart))) {
      this.logger.error(`invalid code(${code})`);
      await this.signupTokenRepository.increment({ id: signup.id }, 'count', 1);
      throw new BadRequestException('Invalid token');
    }
    let recipient = '';
    if (signup.extraData.recipient) {
      const str: string = signup.extraData.recipient;
      const iv = Buffer.from(str.split('.')[1], 'hex');
      recipient = await this.securityService.decrypt(str.split('.')[0], code, iv);
    }
    let email = '';
    let phoneNumber = '';
    if (signup.extraData.recipientType == RecipientType.Email.toString()) {
      email = recipient;
    } else if (signup.extraData.recipientType == RecipientType.Sms.toString()) {
      phoneNumber = recipient;
    }
    const user = await this.usersService.create(profile, email, phoneNumber);
    this.signupTokenRepository.remove(signup);
    return user;
  }
}
