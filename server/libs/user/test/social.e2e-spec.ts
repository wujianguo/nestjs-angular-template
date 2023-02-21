import { AppContext } from './common/app';
import { UserClient } from './common/client';
import { SocialAuthType } from '../src/dto/social.dto';

describe('Social', () => {
  let context: AppContext;
  let client: UserClient;
  let index = 0;
  const provider = 'mock';

  beforeAll(async () => {
    context = await new AppContext().build();
  });

  afterAll(async () => {
    await context.close();
  });

  describe('success', () => {
    beforeEach(async () => {
      index += 1000;
      client = new UserClient(context);
    });

    it('signup', async () => {
      const username = `usernames${index}`;
      const password = `Password1`;
      const identifier = 'identifier';
      await client.socialAuthURL(provider, SocialAuthType.Signup).expect(200);
      const resp = await client.socialAuth(provider, { code: `s-${identifier}`, state: 'signup' }).expect(200);
      expect(resp.body.signupToken.length).toBeGreaterThan(0);
      const resp1 = await client.signupComplete({
        token: resp.body.signupToken,
        username: username,
        password: password,
      });
      expect(resp1.status).toBe(201);
      expect(resp1.body.username).toBe(username);
      const token = resp1.body.token;
      const connections = await client.socialConnections(token).expect(200);
      expect(connections.body.length).toBe(1);
      expect(connections.body[0].provider).toBe(provider);
      await client.login({ login: username, password }).expect(200);
      await client.socialAuthURL(provider, SocialAuthType.Signup).expect(200);
      const resp3 = await client.socialAuth(provider, { code: `s-${identifier}`, state: 'signup' }).expect(200);
      expect(resp3.body.user).toBeDefined();
      expect(resp3.body.user.username).toBe(username);
      // todo: signout
      // await client.signout(username, password);
    });

    it('connect', async () => {
      const identifier = 'identifier2';
      const username = `username${index}`;
      const recipient = `user${index}@example.com`;
      const password = `Password1`;
      await client.register(username, recipient, password);
      const resp = await client.login({ login: username, password }).expect(200);
      expect(resp.body.username).toBe(username);
      const token = resp.body.token;

      await client.socialAuthURL(provider, SocialAuthType.Connect).expect(200);
      await client.socialConnect(provider, { code: `s-${identifier}`, state: 'connect' }, token).expect(204);
      const connections = await client.socialConnections(token).expect(200);
      expect(connections.body.length).toBe(1);
      expect(connections.body[0].provider).toBe(provider);
      expect(connections.body[0].connected).toBe(true);

      await client.socialAuthURL(provider, SocialAuthType.Signup).expect(200);
      const resp2 = await client.socialAuth(provider, { code: `s-${identifier}`, state: 'signup' }).expect(200);
      expect(resp2.body.user).toBeDefined();
      expect(resp2.body.user.username).toBe(username);

      const username2 = `username2${index}`;
      const recipient2 = `user2${index}@example.com`;
      await client.register(username2, recipient2, password);
      const resp22 = await client.login({ login: username2, password }).expect(200);
      expect(resp22.body.username).toBe(username2);
      const token2 = resp22.body.token;

      await client.socialAuthURL(provider, SocialAuthType.Connect).expect(200);
      await client.socialConnect(provider, { code: `s-${identifier}`, state: 'connect' }, token2).expect(400);

      await client.socialDisconnect(provider, token).expect(204);
      const connections2 = await client.socialConnections(token).expect(200);
      expect(connections2.body.length).toBe(1);
      expect(connections2.body[0].provider).toBe(provider);
      expect(connections2.body[0].connected).toBe(false);

      await client.socialConnect(provider, { code: `s-${identifier}`, state: 'connect' }, token2).expect(204);

      // todo: signout
      // await client.signout(username, password);
    });
  });
});
