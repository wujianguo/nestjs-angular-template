import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { SignupProfileDto } from '../dto/signup.dto';
import { UpdateUserRequest } from '../dto/user.dto';
import { User } from '../entities/user.entity';
import { SecurityService } from './security.service';
import { SocialUser } from '../user-module-options.interface';
import { SocialAccount } from '../entities/social-account.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(SocialAccount)
    private socialAccountRepository: Repository<SocialAccount>,
    private securityService: SecurityService,
    private dataSource: DataSource,
  ) {}

  isEmail(login: string) {
    return login.indexOf('@') > 0;
  }

  isPhoneNumber(login: string) {
    return login.length > 0 && login[0] === '+';
  }

  private where(login: string): FindOptionsWhere<User> {
    if (this.isEmail(login)) {
      return { hashedEmail: this.securityService.hmac(login) };
    } else if (this.isPhoneNumber(login)) {
      return { hashedPhoneNumber: this.securityService.hmac(login) };
    } else {
      return { username: login };
    }
  }

  private desensitizeEmail(email: string): string {
    const index = email.lastIndexOf('@');
    if (index > 4) {
      return email.substring(0, index - 4) + '****' + email.substring(index);
    } else if (index > 0) {
      return email.substring(0, index - 1) + '*' + email.substring(index);
    }
    return email;
  }

  private desensitizePhoneNumber(phoneNumber: string): string {
    const len = phoneNumber.length;
    if (len > 4) {
      return phoneNumber.substring(0, len - 8 > 0 ? len - 8 : 2) + '****' + phoneNumber.substring(len - 4);
    }
    return phoneNumber;
  }

  loginExistsException(login: string): BadRequestException {
    if (this.isEmail(login)) {
      return new BadRequestException('email already exists', 'EmailExists');
    } else if (this.isPhoneNumber(login)) {
      return new BadRequestException('phone number already exists', 'PhoneNumberExists');
    } else {
      return new BadRequestException('username already exists', 'UsernameExists');
    }
  }

  private async encrypt(recipient: string, hashedPassword: string, iv: string): Promise<string> {
    let key = '';
    if (hashedPassword.length >= 26) {
      key = hashedPassword.substring(10, 26);
    }
    return await this.securityService.encrypt(recipient, key, Buffer.from(iv, 'hex'));
  }

  private async decrypt(encryptedRecipient: string, hashedPassword: string, iv: string): Promise<string> {
    let key = '';
    if (hashedPassword.length >= 26) {
      key = hashedPassword.substring(10, 26);
    }
    return this.securityService.decrypt(encryptedRecipient, key, Buffer.from(iv, 'hex'));
  }

  async email(user: User): Promise<string> {
    if (user.encryptedEmail) {
      return await this.decrypt(user.encryptedEmail, user.password, user.iv);
    } else {
      return '';
    }
  }

  async phoneNumber(user: User): Promise<string> {
    if (user.encryptedPhoneNumber) {
      return await this.decrypt(user.encryptedPhoneNumber, user.password, user.iv);
    } else {
      return '';
    }
  }

  async setEmail(
    entity: User,
    email: string,
    hashedPassword: string,
  ): Promise<{ desensitizedEmail: string; encryptedEmail: string; hashedEmail: string }> {
    const desensitizedEmail = this.desensitizeEmail(email);
    const encryptedEmail = await this.encrypt(email, hashedPassword, entity.iv);
    const hashedEmail = this.securityService.hmac(email);
    return { desensitizedEmail, encryptedEmail, hashedEmail };
  }

  async setPhoneNumber(
    entity: User,
    phoneNumber: string,
    hashedPassword: string,
  ): Promise<{ desensitizedPhoneNumber: string; encryptedPhoneNumber: string; hashedPhoneNumber: string }> {
    const desensitizedPhoneNumber = this.desensitizePhoneNumber(phoneNumber);
    const encryptedPhoneNumber = await this.encrypt(phoneNumber, hashedPassword, entity.iv);
    const hashedPhoneNumber = this.securityService.hmac(phoneNumber);
    return { desensitizedPhoneNumber, encryptedPhoneNumber, hashedPhoneNumber };
  }

  createSocialAccount(user: User, provider: string, socialUser: SocialUser): SocialAccount {
    const social = new SocialAccount();
    social.provider = provider;
    social.identifier = socialUser.identifier;
    social.nickname = socialUser.nickname;
    social.avatar = socialUser.avatar || '';
    social.extraData = socialUser.origin || {};
    social.user = user;
    return social;
  }

  async create(
    profile: SignupProfileDto,
    email?: string,
    phoneNumber?: string,
    socialProvider?: string,
    socialUser?: SocialUser,
  ): Promise<User> {
    const exist1 = await this.usersRepository.exist({ where: { username: profile.username } });
    if (exist1) {
      this.logger.error(`username(${profile.username}) exists`);
      throw this.loginExistsException(profile.username);
    }

    const entity = new User();
    entity.username = profile.username;
    if (profile.firstName) {
      entity.firstName = profile.firstName;
    }
    if (profile.lastName) {
      entity.lastName = profile.lastName;
    }
    entity.password = '';
    if (profile.password) {
      entity.password = await this.securityService.bcryptHash(profile.password);
    }
    const iv = this.securityService.randomBytes();
    entity.iv = iv.toString('hex');
    const where: FindOptionsWhere<User>[] = [{ username: entity.username }];
    let exception: BadRequestException;
    if (email) {
      const emailMeta = await this.setEmail(entity, email, entity.password);
      entity.encryptedEmail = emailMeta.encryptedEmail;
      entity.hashedEmail = emailMeta.hashedEmail;
      entity.desensitizedEmail = emailMeta.desensitizedEmail;
      where.push({ hashedEmail: entity.hashedEmail });
      exception = this.loginExistsException(email);
    }
    if (phoneNumber) {
      const phoneNumberMeta = await this.setPhoneNumber(entity, phoneNumber, entity.password);
      entity.encryptedPhoneNumber = phoneNumberMeta.encryptedPhoneNumber;
      entity.hashedPhoneNumber = phoneNumberMeta.hashedPhoneNumber;
      entity.desensitizedPhoneNumber = phoneNumberMeta.desensitizedPhoneNumber;
      where.push({ hashedPhoneNumber: entity.hashedPhoneNumber });
      exception = this.loginExistsException(phoneNumber);
    }

    let user!: User;
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      const exist2 = await transactionalEntityManager.exists(User, { where });
      if (exist2) {
        const desensitizeEmail = this.desensitizeEmail(email || '');
        const desensitizePhoneNumber = this.desensitizePhoneNumber(phoneNumber || '');
        this.logger.error(`email/phone (${desensitizeEmail}${desensitizePhoneNumber}) exists`);
        throw exception;
      }
      const record = this.usersRepository.create(entity);
      user = await transactionalEntityManager.save(record);
      if (socialProvider && socialUser) {
        const social = this.createSocialAccount(user, socialProvider, socialUser);
        await transactionalEntityManager.save(social);
      }
    });
    return user;
  }

  async exists(login: string): Promise<boolean> {
    return this.usersRepository.exist({ where: this.where(login) });
  }

  async findOne(login: string): Promise<User | null> {
    return this.usersRepository.findOneBy(this.where(login));
  }

  async findBySocial(provider: string, identifier: string): Promise<User | null> {
    const social = await this.socialAccountRepository.findOne({
      where: { provider: provider, identifier: identifier },
      relations: { user: true },
    });
    return social?.user || null;
  }

  async findSocialConnections(user: User): Promise<SocialAccount[]> {
    return await this.socialAccountRepository.find({ where: { userId: user.id } });
  }

  async connectSocial(user: User, provider: string, socialUser: SocialUser): Promise<SocialAccount> {
    return await this.dataSource.transaction(async (transactionalEntityManager) => {
      const exists = await transactionalEntityManager.exists(SocialAccount, {
        where: {
          provider: provider,
          identifier: socialUser.identifier,
        },
      });
      if (exists) {
        throw new BadRequestException('This social user has already be connected.');
      }
      const social = this.createSocialAccount(user, provider, socialUser);
      return await transactionalEntityManager.save(social);
    });
  }

  async disconnectSocial(user: User, provider: string) {
    await this.socialAccountRepository.delete({ provider: provider, userId: user.id });
  }

  async update(user: User, dto: UpdateUserRequest): Promise<User> {
    await this.usersRepository.update({ id: user.id }, dto);
    if (dto.username !== null && dto.username !== undefined) {
      user.username = dto.username;
    }
    if (dto.firstName !== null && dto.firstName !== undefined) {
      user.firstName = dto.firstName;
    }
    if (dto.lastName !== null && dto.lastName !== undefined) {
      user.lastName = dto.lastName;
    }
    return user;
  }

  async updateEmail(user: User, email: string): Promise<void> {
    const emailMeta = await this.setEmail(user, email, user.password);
    const update: Partial<User> = {};
    update.encryptedEmail = emailMeta.encryptedEmail;
    update.hashedEmail = emailMeta.hashedEmail;
    update.desensitizedEmail = emailMeta.desensitizedEmail;
    return await this.dataSource.transaction(async (transactionalEntityManager) => {
      if (await transactionalEntityManager.exists(User, { where: { hashedEmail: emailMeta.hashedEmail } })) {
        throw this.loginExistsException(email);
      }
      await transactionalEntityManager.update(User, { id: user.id }, update);
    });
  }

  async updatePhoneNumber(user: User, phoneNumber: string): Promise<void> {
    const phoneNumberMeta = await this.setPhoneNumber(user, phoneNumber, user.password);
    const update: Partial<User> = {};
    update.encryptedPhoneNumber = phoneNumberMeta.encryptedPhoneNumber;
    update.hashedPhoneNumber = phoneNumberMeta.hashedPhoneNumber;
    update.desensitizedPhoneNumber = phoneNumberMeta.desensitizedPhoneNumber;
    return await this.dataSource.transaction(async (transactionalEntityManager) => {
      if (
        await transactionalEntityManager.exists(User, {
          where: { hashedPhoneNumber: phoneNumberMeta.hashedPhoneNumber },
        })
      ) {
        throw this.loginExistsException(phoneNumber);
      }
      await transactionalEntityManager.update(User, { id: user.id }, update);
    });
  }

  async changePassword(user: User, newPassword: string): Promise<void> {
    const password = await this.securityService.bcryptHash(newPassword);
    const update: Partial<User> = { password: password };
    if (user.encryptedEmail) {
      const email = await this.email(user);
      const emailMeta = await this.setEmail(user, email, password);
      update.encryptedEmail = emailMeta.encryptedEmail;
      update.hashedEmail = emailMeta.hashedEmail;
      update.desensitizedEmail = emailMeta.desensitizedEmail;
    }
    if (user.encryptedPhoneNumber) {
      const phoneNumber = await this.phoneNumber(user);
      const phoneNumberMeta = await this.setPhoneNumber(user, phoneNumber, password);
      update.encryptedPhoneNumber = phoneNumberMeta.encryptedPhoneNumber;
      update.hashedPhoneNumber = phoneNumberMeta.hashedPhoneNumber;
      update.desensitizedPhoneNumber = phoneNumberMeta.desensitizedPhoneNumber;
    }
    await this.usersRepository.update({ id: user.id }, update);
  }

  async remove(user: User): Promise<void> {
    // todo: remove relations
    await this.usersRepository.remove(user);
  }
}
