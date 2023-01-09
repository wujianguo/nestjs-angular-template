import { INestApplication } from '@nestjs/common';
import { closeApp, initializeApp } from './common/app';
import { UserClient } from './common/client';

describe('Signup', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initializeApp();
  });

  afterAll(async () => {
    await closeApp(app);
  });

  it('Send signup email should success', async () => {
    const client = new UserClient(app);
    const resp = await client.signupEmailSend({ email: 'test@example.com' }).expect(201);
    const token = resp.body.token;
    expect(token.length).toBeGreaterThan(10);
  });
});
