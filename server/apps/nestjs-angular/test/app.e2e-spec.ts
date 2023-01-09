import { INestApplication } from '@nestjs/common';
import { closeApp, initializeApp } from './common/app';
import { Client } from './common/client';

describe('App', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initializeApp();
  });

  afterAll(async () => {
    await closeApp(app);
  });

  it('hello', async () => {
    const client = new Client(app);
    client.getHello().expect(200).expect('{"data":"Hello World!"}');
  });
});
