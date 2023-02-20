import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { SignupToken } from '../entities/signup.entity';
import { SignupProfileDto } from '../dto/signup.dto';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { SecurityService } from './security.service';
import { UserModuleOptionsInternal, USER_OPTIONS } from '../user-module-options.interface';
import { SocialUser } from '../user-module-options.interface';

@Injectable()
export class SignupService {
  private readonly logger = new Logger(SignupService.name);

  constructor(
    @InjectRepository(SignupToken) private signupTokenRepository: Repository<SignupToken>,
    @Inject(USER_OPTIONS) private config: UserModuleOptionsInternal,
    private usersService: UsersService,
    private securityService: SecurityService,
  ) {}

  isSocialRecipient(recipient: string): boolean {
    return recipient.startsWith('#');
  }

  async createSignupToken(recipient: string, socialProvider?: string, socialUser?: SocialUser): Promise<string> {
    if (!this.isSocialRecipient(recipient)) {
      const exist = await this.usersService.exists(recipient);
      if (exist) {
        throw this.usersService.loginExistsException(recipient);
      }
    }

    const code = this.securityService.randomCode(this.securityService.codeSize);
    const entity = new SignupToken();
    entity.token = this.securityService.randomToken(this.securityService.tokenSize);
    const iv = this.securityService.randomBytes();
    const encryptedRecipient = (await this.securityService.encrypt(recipient, code, iv)) + '.' + iv.toString('hex');
    entity.extraData = {
      recipient: encryptedRecipient,
      socialProvider: socialProvider,
      socialUser: socialUser,
    };
    const record = this.signupTokenRepository.create(entity);
    const resp = await this.signupTokenRepository.save(record);
    return resp.token + code + this.securityService.hmac(code);
  }

  async completeSignup(token: string, profile: SignupProfileDto): Promise<User> {
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
    if (!this.isSocialRecipient(recipient)) {
      if (this.usersService.isEmail(recipient)) {
        email = recipient;
      } else if (this.usersService.isPhoneNumber(recipient)) {
        phoneNumber = recipient;
      }
    }
    let socialUser: SocialUser | undefined = undefined;
    let socialProvider: string | undefined = undefined;
    if (signup.extraData.socialUser) {
      socialUser = signup.extraData.socialUser;
      socialProvider = signup.extraData.socialProvider;
    }
    const user = await this.usersService.create(profile, email, phoneNumber, socialProvider, socialUser);
    this.signupTokenRepository.remove(signup);
    return user;
  }
}
