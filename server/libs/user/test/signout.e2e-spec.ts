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
    it('email', async () => {
      const username = `username1`;
      const recipient = `user$1@example.com`;
      const password = `Password1`;
      const resp = await client.register(username, recipient, password);

      const client2 = new UserClient(context);
      client2.setToken(resp.token);
      await client2.signoutSmsSend({ password }).expect(400);
      const resp2 = await client2.signoutEmailSend({ password });
      const token = resp2.body.token;
      const code = context.getVerifyCode();
      await client2.signoutComplete({ token, code }).expect(204);
      await client2.profile().expect(401);
      await client.login({ login: username, password }).expect(400);
    });

    it('phone number', async () => {
      const username = `username2`;
      // const recipient = `user$2@example.com`;
      const recipient = `+8618100001234`;
      const password = `Password1`;
      const resp = await client.register(username, recipient, password);

      const client2 = new UserClient(context);
      client2.setToken(resp.token);
      await client2.signoutEmailSend({ password }).expect(400);
      const resp2 = await client2.signoutSmsSend({ password });
      const token = resp2.body.token;
      const code = context.getVerifyCode();
      await client2.signoutComplete({ token, code }).expect(204);
      await client2.profile().expect(401);
      await client.login({ login: username, password }).expect(400);
    });
  });
});
