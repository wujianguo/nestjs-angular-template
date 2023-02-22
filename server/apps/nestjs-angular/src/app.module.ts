import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { userEntities, UserModule } from '@app/user';
import { EmailModule, SmsModule } from '@app/message';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { NodeMailerEmailAdapter } from './common/nodemailer-email.adapter';
import { AppController } from './app.controller';
import { CommonConfig, DatabaseConfig, loadConfig } from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [loadConfig],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'web'),
      renderPath: new RegExp('^(?!/api).*'),
      exclude: ['/api*'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<DatabaseConfig>('db')?.sqlite?.database || ':memory:',
        entities: [...userEntities],
        synchronize: configService.get<CommonConfig>('common')?.debug,
        logging: configService.get<CommonConfig>('common')?.debug,
      }),
      inject: [ConfigService],
    }),
    UserModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const auth = configService.get('auth');
        return {
          securityKey: auth?.security || 'xyz',
          email: auth?.email,
          sms: auth?.sms,
          socials: auth?.socials || [],
        };
      },
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const email = configService.get('auth.email');
        return {
          transport: {
            host: email?.host,
            port: email?.port,
            secure: email?.secure,
            auth: { user: email?.user, pass: email?.password },
          },
        };
      },
      inject: [ConfigService],
    }),
    EmailModule.forRootAsync({
      imports: [ConfigModule, MailerModule],
      useFactory: (configService: ConfigService, mailserService: MailerService) => {
        if (configService.get('auth.email.user') && configService.get('auth.email.password')) {
          return { adapter: new NodeMailerEmailAdapter(mailserService, configService.get('auth.email.from') || '') };
        } else {
          return {};
        }
      },
      inject: [ConfigService, MailerService],
    }),
    SmsModule.forRoot(),
  ],
  controllers: [AppController],
})
export class AppModule {}
