import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailMessage, EmailModule, LocmemEmailAdapter, LocmemSmsAdapter, SmsMessage, SmsModule } from '@app/message';
import { UserModule } from '../../src/user.module';
import { userEntities } from '../../src/entities/entities';

export class AppContext {
  app: INestApplication;
  emailAdapter: LocmemEmailAdapter;
  smsAdapter: LocmemSmsAdapter;

  async build(): Promise<AppContext> {
    this.emailAdapter = new LocmemEmailAdapter();
    this.smsAdapter = new LocmemSmsAdapter();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [...userEntities],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([...userEntities]),
        UserModule.forRoot({
          securityKey: 'xyz',
          sendLimitTime: 3,
          codeExpireTime: 3,
          signupExpireTime: 3,
          codeVerifyMaxCount: 4,
          authLimitTime: 5,
        }),
        EmailModule.forRoot({ adapter: this.emailAdapter }),
        SmsModule.forRoot({ adapter: this.smsAdapter }),
      ],
    }).compile();

    const app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    // const httpAdapter = app.get(HttpAdapterHost);
    // app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
    await app.init();
    this.app = app;
    return this;
  }

  async close(): Promise<void> {
    await this.app.close();
  }

  getVerifyCode(): string {
    const rexp = new RegExp('\\d{6}', 'g');
    let lastEmailMessage: EmailMessage | null = null;
    if (this.emailAdapter.messages.length > 0) {
      lastEmailMessage = this.emailAdapter.messages[0];
    }
    let lastSmsMessage: SmsMessage | null = null;
    if (this.smsAdapter.messages.length > 0) {
      lastSmsMessage = this.smsAdapter.messages[0];
    }
    let msg = '';
    if (lastEmailMessage && lastSmsMessage) {
      if (lastEmailMessage.time > lastSmsMessage.time) {
        msg = lastEmailMessage.message;
      } else {
        msg = lastSmsMessage.message;
      }
    } else if (lastEmailMessage) {
      msg = lastEmailMessage.message;
    } else if (lastSmsMessage) {
      msg = lastSmsMessage.message;
    }
    const codes = rexp.exec(msg);
    if (codes && codes.length > 0) {
      return codes[0];
    }
    return '';
  }

  randomString(characters: string, length: number): string {
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  randomCode(length = 6): string {
    const characters = '0123456789';
    return this.randomString(characters, length);
  }

  randomToken(length = 32): string {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyz';
    return this.randomString(characters, length);
  }
}
