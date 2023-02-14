import { AppContext } from './common/app';
import { UserClient } from './common/client';

describe('Auth', () => {
  let context: AppContext;
  let client: UserClient;
  let index = 0;

  beforeAll(async () => {
    context = await new AppContext().build();
  });

  afterAll(async () => {
    await context.close();
  });

  describe('success', () => {
    beforeEach(async () => {
      index += 1;
      client = new UserClient(context);
    });

    it('username', async () => {
      const username = `username${index}`;
      const recipient = `user${index}@example.com`;
      const password = `Password1`;
      await client.register(username, recipient, password);
      const resp = await client.login({ login: username, password }).expect(200);
      expect(resp.body.username).toBe(username);
    });

    it('email', async () => {
      const username = `username${index}`;
      const recipient = `user${index}@example.com`;
      const password = `Password1`;
      await client.register(username, recipient, password);
      const resp = await client.login({ login: recipient, password }).expect(200);
      expect(resp.body.username).toBe(username);
    });

    it('phone number', async () => {
      const username = `username${index}`;
      const recipient = `+8618100001234`;
      const password = `Password1`;
      await client.register(username, recipient, password);
      const resp = await client.login({ login: recipient, password }).expect(200);
      expect(resp.body.username).toBe(username);
    });

    it('logout', async () => {
      const username = `username${index}`;
      const recipient = `user${index}@example.com`;
      const password = `Password1`;
      await client.register(username, recipient, password);
      const resp = await client.login({ login: username, password }).expect(200);
      expect(resp.body.username).toBe(username);

      const client2 = new UserClient(context);
      client2.setToken(resp.body.token);
      const profile = await client2.profile().expect(200);
      expect(profile.body.username).toBe(username);
      await client2.logout().expect(204);
      await client2.profile().expect(401);
    });
  });

  describe('failure', () => {
    beforeEach(async () => {
      index += 1;
      client = new UserClient(context);
    });

    it('password error', async () => {
      const username = `username${index}`;
      const recipient = `user${index}@example.com`;
      const password = `Password1`;
      await client.register(username, recipient, password);
      await client.login({ login: username, password: '123456' }).expect(400);
    });
  });

  describe('limit', () => {
    beforeEach(async () => {
      index += 1;
      client = new UserClient(context);
    });

    it('password attempt', async () => {
      const username = `username${index}`;
      const recipient = `user${index}@example.com`;
      const password = `Password1`;
      await client.register(username, recipient, password);
      await client.login({ login: username, password: '123456' }).expect(400);
      await client.login({ login: username, password: '123456' }).expect(400);
      await client.login({ login: username, password: '123456' }).expect(400);
      await client.login({ login: username, password }).expect(429);
      await new Promise((r) => setTimeout(r, 6000));
      await client.login({ login: username, password }).expect(200);
    }, 100000);

    it('device number', async () => {
      const username = `username${index}`;
      const recipient = `user${index}@example.com`;
      const password = `Password1`;
      await client.register(username, recipient, password);
      const resp = await client.login({ login: username, password }).expect(200);

      const client2 = new UserClient(context);
      client2.setToken(resp.body.token);
      await client2.profile().expect(200);

      await client.login({ login: username, password }).expect(200);
      await client.login({ login: username, password }).expect(200);
      await client.login({ login: username, password }).expect(200);
      await client2.profile().expect(401);
    });
  });
});
