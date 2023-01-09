import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageModule } from '@app/message';
import { UserModule } from '../../src/user.module';
import { userEntities } from '../../src/entities/entities';

export const loadConfig = () => {
  const auth = {
    signupExpireTime: 5,
  };
  return {
    auth: auth,
  };
};

export const initializeApp = async (): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        load: [loadConfig],
      }),
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        entities: [...userEntities],
        synchronize: true,
      }),
      UserModule,
      MessageModule,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication({
    logger: ['error', 'warn', 'debug', 'log'],
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.init();
  return app;
};

export const closeApp = async (app: INestApplication) => {
  await app.close();
};
