import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { SignupProfileDto } from '../dto/signup.dto';
import { UpdateUserRequest } from '../dto/user.dto';
import { User } from '../entities/user.entity';
import { SecurityService } from './security.service';
import { SocialUser } from '../user-module-options.interface';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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
      entity.desensitizedEmail = this.desensitizeEmail(email);
      entity.encryptedEmail = await this.encrypt(email, entity.password, entity.iv);
      entity.hashedEmail = this.securityService.hmac(email);
      where.push({ hashedEmail: entity.hashedEmail });
      exception = this.loginExistsException(email);
    }
    if (phoneNumber) {
      entity.desensitizedPhoneNumber = this.desensitizePhoneNumber(phoneNumber);
      entity.encryptedPhoneNumber = await this.encrypt(phoneNumber, entity.password, entity.iv);
      entity.hashedPhoneNumber = this.securityService.hmac(phoneNumber);
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
    return this.usersRepository.findOneBy(this.where('login'));
  }

  async connectSocial(user: User, socialUser: SocialUser) {
    return;
  }

  async disconnectSocial(user: User, provider: string) {
    return;
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

  async changePassword(user: User, newPassword: string): Promise<void> {
    const password = await this.securityService.bcryptHash(newPassword);
    await this.usersRepository.update({ id: user.id }, { password });
  }

  async remove(user: User): Promise<void> {
    // todo: remove relations
    await this.usersRepository.remove(user);
  }
}
