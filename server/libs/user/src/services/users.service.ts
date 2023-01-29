import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { SignupProfileDto } from '../dto/signup.dto';
import { UpdateUserRequest } from '../dto/user.dto';
import { User } from '../entities/user.entity';
import { SecurityService } from './security.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private securityService: SecurityService,
    private dataSource: DataSource,
  ) {}

  private where(login: string): FindOptionsWhere<User> {
    if (login.indexOf('@') >= 0) {
      return { hashedEmail: this.securityService.hmac(login) };
    } else if (login.length > 0 && login[0] === '+') {
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

  usernameExistsException(): BadRequestException {
    return new BadRequestException('username already exists', 'UsernameExists');
  }

  emailExistsException(): BadRequestException {
    return new BadRequestException('email already exists', 'EmailExists');
  }

  phoneNumberExistsException(): BadRequestException {
    return new BadRequestException('phone number already exists', 'PhoneNumberExists');
  }

  async create(profile: SignupProfileDto, email?: string, phoneNumber?: string): Promise<User> {
    const exist1 = await this.usersRepository.exist({ where: { username: profile.username } });
    if (exist1) {
      this.logger.error(`username(${profile.username}) exists`);
      throw this.usernameExistsException();
    }

    const entity = new User();
    entity.username = profile.username;
    entity.firstName = profile.firstName;
    entity.lastName = profile.lastName;
    let key = '';
    if (profile.password) {
      entity.password = await this.securityService.bcryptHash(profile.password);
      key = entity.password.substring(10, 26);
    }
    const iv = this.securityService.randomBytes();
    entity.iv = iv.toString('hex');
    const where: FindOptionsWhere<User>[] = [{ username: entity.username }];
    let exception: BadRequestException;
    if (email) {
      entity.desensitizedEmail = this.desensitizeEmail(email);
      entity.encryptedEmail = await this.securityService.encrypt(email, key, iv);
      entity.hashedEmail = this.securityService.hmac(email);
      where.push({ hashedEmail: entity.hashedEmail });
      exception = this.emailExistsException();
    }
    if (phoneNumber) {
      entity.desensitizedEmail = this.desensitizePhoneNumber(phoneNumber);
      entity.encryptedPhoneNumber = await this.securityService.encrypt(phoneNumber, key, iv);
      entity.hashedPhoneNumber = this.securityService.hmac(phoneNumber);
      where.push({ hashedPhoneNumber: entity.hashedPhoneNumber });
      exception = this.phoneNumberExistsException();
    }

    let user: User;
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      const exist2 = await transactionalEntityManager.exists(User, { where });
      if (exist2) {
        this.logger.error(`email/phone (${email}-${phoneNumber}) exists`);
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
}
