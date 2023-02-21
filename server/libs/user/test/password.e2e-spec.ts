import { AppContext } from './common/app';
import { UserClient } from './common/client';

describe('Password', () => {
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

  it('change', async () => {
    const username = `username1`;
    const recipient = `user1@example.com`;
    const password = `Password1`;
    const resp = await client.register(username, recipient, password);
    expect(resp.email).toBe('u****@example.com');

    const resp2 = await client.login({ login: username, password });
    const client2 = new UserClient(context);
    client2.setToken(resp2.body.token);
    await client2.profile().expect(200);
    await client2.changeRecipient('+8617200002234');

    const client3 = new UserClient(context);
    client3.setToken(resp.token);
    const newPassword = 'newPassword1';
    await client3.changePassword({ oldPassword: newPassword, newPassword }).expect(400);
    await client3.changePassword({ oldPassword: password, newPassword }).expect(204);

    await client2.profile().expect(401);
    await client.login({ login: username, password }).expect(400);
    const resp3 = await client.login({ login: username, password: newPassword }).expect(200);
    expect(resp3.body.email).toBe('u****@example.com');
  });

  it('reset', async () => {
    const username = `username2`;
    const recipient = `user2@example.com`;
    const password = `Password2`;
    const resp = await client.register(username, recipient, password);

    const resp2 = await client.login({ login: username, password });
    const client2 = new UserClient(context);
    client2.setToken(resp2.body.token);
    await client2.profile().expect(200);

    const resp3 = await client.resetPswdEmailSend({ email: recipient }).expect(201);
    const token = resp3.body.token;
    const code = context.getVerifyCode();
    const newPassword = 'newPassword2';
    await client.resetPswdComplete({ token, code, newPassword }).expect(204);

    await client2.profile().expect(401);
    client2.setToken(resp.token);
    await client2.profile().expect(401);
    await client.login({ login: username, password }).expect(400);
    const resp5 = await client.login({ login: username, password: newPassword }).expect(200);
    expect(resp5.body.email).toBe('u****@example.com');

    const resp4 = await client.resetPswdSmsSend({ phoneNumber: '+8617200001234' }).expect(201);
    const token4 = resp4.body.token;
    const code4 = context.getVerifyCode();
    await client.resetPswdComplete({ token: token4, code: code4, newPassword }).expect(400);
  });
});
