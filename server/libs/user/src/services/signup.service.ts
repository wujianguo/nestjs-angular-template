import { EmailService } from '@app/message';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { MultiFactorVerifyCode, RecipientType } from '../entities/mfa.entity';
import { AdminAuthConfig } from '../dto/auth-config.dto';
import { SignupToken } from '../entities/signup.entity';
import { SignupProfileDto } from '../dto/signup.dto';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';

@Injectable()
export class SignupService {
  constructor(
    @InjectRepository(MultiFactorVerifyCode) private codeRepository: Repository<MultiFactorVerifyCode>,
    @InjectRepository(SignupToken) private signupTokenRepository: Repository<SignupToken>,
    private emailService: EmailService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  private randomCode(length: number): string {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async signupEmailSend(email: string): Promise<string> {
    const code = this.randomCode(6);
    await this.emailService.send('Sign up', code, [email]);
    const entity = new MultiFactorVerifyCode();
    entity.code = code;
    entity.recipient = email;
    entity.recipientType = RecipientType.Email;
    entity.usage = 'signup';
    const codeExpireTime = this.configService.get<AdminAuthConfig>('auth').codeExpireTime;
    entity.expireOn = new Date(new Date().getTime() + codeExpireTime * 1000);
    const record = this.codeRepository.create(entity);
    const resp = await this.codeRepository.save(record);
    return resp.token;
  }

  async signupVerify(token: string, code: string): Promise<string> {
    const usage = 'signup';
    const now = new Date();
    const codeObject = await this.codeRepository.findOneByOrFail({ token, code, usage, expireOn: MoreThan(now) });
    const entity = new SignupToken();
    const codeExpireTime = this.configService.get<AdminAuthConfig>('auth').signupExpireTime;
    entity.expireOn = new Date(new Date().getTime() + codeExpireTime * 1000);
    entity.extraData = {
      recipientType: codeObject.recipientType.toString(),
      recipient: codeObject.recipient,
    };
    const record = this.signupTokenRepository.create(entity);
    const resp = await this.signupTokenRepository.save(record);
    return resp.token;
  }

  async signupComplete(token: string, profile: SignupProfileDto): Promise<User> {
    const now = new Date();
    await this.signupTokenRepository.findOneByOrFail({ token, expireOn: MoreThan(now) });
    return this.usersService.create(profile);
  }
}
