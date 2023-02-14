import { AppContext } from './common/app';
import { UserClient } from './common/client';

describe('Signout', () => {
  let context: AppContext;
  let client: UserClient;

  beforeAll(async () => {
    context = await new AppContext().build();
  });

  afterAll(async () => {
    await context.close();
  });

  beforeEach(async () => {
    client = new UserClient(context);
  });

  describe('success', () => {
    const username = `usernamesignouts`;
    const password = `Password1`;

    // afterEach(async () => {
    //   await client.signout(username, password);
    // });

    async function success(client2: UserClient, token: string) {
      const code = context.getVerifyCode();
      await client2.signoutComplete({ token, code }).expect(204);
      await client2.profile().expect(401);
      await client.login({ login: username, password }).expect(400);
    }

    it('email', async () => {
      const recipient = `usersignout@example.com`;
      const resp = await client.register(username, recipient, password);

      const client2 = new UserClient(context);
      client2.setToken(resp.token);
      await client2.signoutSmsSend({ password }).expect(400);
      const resp2 = await client2.signoutEmailSend({ password });

      const token = resp2.body.token;
      await success(client2, token);
    });

    it('phone number', async () => {
      const recipient = `+8618100001234`;
      const resp = await client.register(username, recipient, password);

      const client2 = new UserClient(context);
      client2.setToken(resp.token);
      await client2.signoutEmailSend({ password }).expect(400);
      const resp2 = await client2.signoutSmsSend({ password });

      const token = resp2.body.token;
      await success(client2, token);
    });
  });

  describe('failure', () => {
    const username = `usernamesignoutf`;
    const password = `Password1`;

    afterEach(async () => {
      await client.signout(username, password);
    });

    it('password error', async () => {
      const recipient = `usersignout@example.com`;
      const resp = await client.register(username, recipient, password);

      const client2 = new UserClient(context);
      client2.setToken(resp.token);
      await client2.signoutSmsSend({ password: 'Password123' }).expect(400);
    });
  });
});
