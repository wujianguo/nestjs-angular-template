import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { EmailService, SmsService } from '@app/message';
import { MultiFactorVerifyCode } from '../entities/mfa.entity';
import { SecurityService } from './security.service';
import { UserModuleOptionsInternal, USER_OPTIONS } from '../user-module-options.interface';

@Injectable()
export class MultiFactorVerifyService {
  private readonly logger = new Logger(MultiFactorVerifyService.name);

  constructor(
    @InjectRepository(MultiFactorVerifyCode) private codeRepository: Repository<MultiFactorVerifyCode>,
    @Inject(USER_OPTIONS) private config: UserModuleOptionsInternal,
    private emailService: EmailService,
    private smsService: SmsService,
    private securityService: SecurityService,
  ) {}

  private async saveCode(code: string, recipient: string, usage: string, associatedId = 0): Promise<string> {
    const entity = new MultiFactorVerifyCode();
    entity.token = this.securityService.randomToken(this.securityService.tokenSize);
    entity.code = await this.securityService.bcryptHash(code);
    entity.hashedRecipient = this.securityService.hmac(recipient);
    const iv = this.securityService.randomBytes();
    entity.encryptedRecipient = (await this.securityService.encrypt(recipient, code, iv)) + '.' + iv.toString('hex');
    entity.usage = usage;
    entity.associatedId = associatedId;
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
    if (!recipient) {
      throw new BadRequestException();
    }
    const exist = await this.recipientExists(recipient);
    if (exist) {
      // todo: set retry-after header
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  async sendEmailCode(email: string, usage: string, associatedId = 0): Promise<string> {
    await this.checkRecipientExists(email);
    const code = this.securityService.randomCode(this.securityService.codeSize);
    await this.emailService.send('Hello', `Hello: your code: [${code}]`, [email]);
    return this.saveCode(code, email, usage, associatedId);
  }

  async sendSmsCode(phoneNumber: string, usage: string, associatedId = 0): Promise<string> {
    await this.checkRecipientExists(phoneNumber);
    const code = this.securityService.randomCode(this.securityService.codeSize);
    await this.smsService.send(`Hello: your code: [${code}]`, [phoneNumber]);
    return this.saveCode(code, phoneNumber, usage, associatedId);
  }

  async verify(
    code: string,
    token: string,
    usage: string,
  ): Promise<{ recipient: string; code: MultiFactorVerifyCode }> {
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
    if (codeObject.encryptedRecipient) {
      const str: string = codeObject.encryptedRecipient;
      const iv = Buffer.from(str.split('.')[1], 'hex');
      recipient = await this.securityService.decrypt(str.split('.')[0], code, iv);
    }
    await this.codeRepository.remove(codeObject);
    return { recipient: recipient, code: codeObject };
  }
}
