import { AppContext } from './common/app';
import { UserClient } from './common/client';

describe('Profile', () => {
  let context: AppContext;
  let client: UserClient;
  let index = 0;

  beforeAll(async () => {
    context = await new AppContext().build();
  });

  afterAll(async () => {
    await context.close();
  });

  beforeEach(async () => {
    index += 1;
    client = new UserClient(context);
  });

  it('get', async () => {
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
  });

  it('update', async () => {
    const username = `username${index}`;
    const recipient = `user${index}@example.com`;
    const password = `Password1`;
    await client.register(username, recipient, password);
    const resp = await client.login({ login: username, password }).expect(200);
    expect(resp.body.username).toBe(username);

    const client2 = new UserClient(context);
    client2.setToken(resp.body.token);
    const firstName = 'xyz';
    const u1 = await client2.updateProfile({ firstName, lastName: 'las', username }).expect(200);
    expect(u1.body.firstName).toBe(firstName);
    const profile = await client2.profile().expect(200);
    expect(profile.body.firstName).toBe(firstName);
  });

  it('recipient', async () => {
    const username = `username${index}`;
    const recipient = `user${index}@example.com`;
    const password = `Password1`;
    await client.register(username, recipient, password);
    const resp = await client.login({ login: username, password }).expect(200);
    expect(resp.body.username).toBe(username);

    const client2 = new UserClient(context);
    client2.setToken(resp.body.token);
    const recipient2 = `userchange${index}@example.com`;
    await client2.changeRecipient(recipient2);

    const recipient3 = `+8617204001234`;
    await client2.changeRecipient(recipient3);
  });
});
