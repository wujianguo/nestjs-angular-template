import { AppContext } from './common/app';
import { UserClient } from './common/client';

describe('Signup', () => {
  let context: AppContext;
  let client: UserClient;

  beforeAll(async () => {
    context = await new AppContext().build();
  });

  afterAll(async () => {
    await context.close();
  });

  beforeEach(() => {
    client = new UserClient(context);
  });

  describe('success', () => {
    async function expectSuccess(token: string) {
      expect(token.length).toBeGreaterThan(10);
      const code = context.getVerifyCode();
      const verifyResp = await client.signupVerify({ token: token, code: code }).expect(200);
      const username = 'myname' + token.substring(0, 4);
      const body = {
        token: verifyResp.body.token,
        username: username,
        password: 'passworD123*x',
      };
      const resp = await client.signupComplete(body).expect(201);
      expect(resp.body.username).toBe(username);

      const client2 = new UserClient(context);
      client2.setToken(resp.body.token);
      const profile = await client2.profile().expect(200);
      expect(profile.body.username).toBe(username);
    }

    it('email', async () => {
      const resp = await client.signupEmailSend({ email: 'test@example.com' }).expect(201);
      await expectSuccess(resp.body.token);
    });

    it('phone number', async () => {
      const resp = await client.signupSmsSend({ phoneNumber: '+8617200001234' }).expect(201);
      await expectSuccess(resp.body.token);
    });
  });

  describe('failure', () => {
    async function signupVerifyCode(code: string, statusCode: number) {
      const resp = await client.signupEmailSend({ email: context.randomCode() + 'telure1@example.com' }).expect(201);
      await client.signupVerify({ token: resp.body.token, code }).expect(statusCode);
    }

    async function signupVerifyToken(token: string, statusCode: number) {
      await client.signupEmailSend({ email: context.randomCode() + 'testfailure2@example.com' }).expect(201);
      const code = context.getVerifyCode();
      await client.signupVerify({ token, code }).expect(statusCode);
    }

    async function signupComplete(token: string, statusCode: number) {
      const body = {
        token: token,
        username: 'myname' + token.substring(token.length - 4),
        password: 'passworD123*x',
      };
      await client.signupComplete(body).expect(statusCode);
    }

    it('send too often', async () => {
      await client.signupEmailSend({ email: 'testsend@example.com' }).expect(201);
      await client.signupEmailSend({ email: 'testsend@example.com' }).expect(429);
      await new Promise((r) => setTimeout(r, 3000));
      await client.signupEmailSend({ email: 'testsend@example.com' }).expect(201);
    }, 100000);

    it('invalid email', async () => {
      await client.signupEmailSend({ email: 'testexample.com' }).expect(400);
    });

    it('invalid phone number', async () => {
      await client.signupSmsSend({ phoneNumber: '8617700001234' }).expect(400);
      await client.signupSmsSend({ phoneNumber: '17700001234' }).expect(400);
    });

    it('invalid code', async () => {
      await signupVerifyCode('code', 400);
      await signupVerifyCode('', 400);
      await signupVerifyCode('12345678', 400);
      await signupVerifyCode('123456', 400);
    });

    it('invalid token', async () => {
      await signupVerifyToken('token', 400);
      await signupVerifyToken('', 400);
      await signupVerifyToken('1op63h6d8twjs668fw9gxspspx2cehta', 400);
      await signupVerifyToken('1op63h6d8twjs668fw9gxspspx2cehta123', 400);
    });

    it('code expire', async () => {
      const resp = await client.signupEmailSend({ email: 'testcodeexpire1@example.com' }).expect(201);
      await new Promise((r) => setTimeout(r, 5000));
      const code = context.getVerifyCode();
      await client.signupVerify({ token: resp.body.token, code }).expect(400);
    }, 100000);

    it('complete signup token expire', async () => {
      const resp = await client.signupEmailSend({ email: 'testtokenexpire1@example.com' }).expect(201);
      const code = context.getVerifyCode();
      const verifyResp = await client.signupVerify({ token: resp.body.token, code }).expect(200);
      await new Promise((r) => setTimeout(r, 5000));
      await signupComplete(verifyResp.body.token, 400);
    }, 100000);

    it('code verify at most 4 times', async () => {
      const resp = await client.signupEmailSend({ email: 'testcvat@example.com' }).expect(201);
      const code = context.getVerifyCode();
      await client.signupVerify({ token: resp.body.token, code: '123456' }).expect(400);
      await client.signupVerify({ token: resp.body.token, code: '123456' }).expect(400);
      await client.signupVerify({ token: resp.body.token, code: '123456' }).expect(400);
      await client.signupVerify({ token: resp.body.token, code: '123456' }).expect(400);
      await client.signupVerify({ token: resp.body.token, code: code }).expect(400);

      const resp2 = await client.signupEmailSend({ email: 'testcvat2@example.com' }).expect(201);
      const code2 = context.getVerifyCode();
      await client.signupVerify({ token: resp2.body.token, code: '123456' }).expect(400);
      await client.signupVerify({ token: resp2.body.token, code: '123456' }).expect(400);
      await client.signupVerify({ token: resp2.body.token, code: '123456' }).expect(400);
      await client.signupVerify({ token: resp2.body.token, code: code2 }).expect(200);
    });

    it('complete', async () => {
      const resp = await client.signupEmailSend({ email: 'testxyz@example.com' }).expect(201);
      const code = context.getVerifyCode();
      const verifyResp = await client.signupVerify({ token: resp.body.token, code }).expect(200);
      const token = verifyResp.body.token;
      await signupComplete('xyz' + token.substring(3), 400);
      await signupComplete(token.substring(0, 32) + token.substring(0, 68) + '00', 400);
      await signupComplete(token.substring(0, 32) + token.substring(0, 68) + '01', 400);
      await signupComplete(token.substring(0, 32) + token.substring(0, 68) + '02', 400);
      await signupComplete(token.substring(0, 32) + token.substring(0, 68) + '03', 400);
      // await signupComplete(token, 201);
      await signupComplete(token, 400);

      const resp2 = await client.signupEmailSend({ email: 'test1234yzx@example.com' }).expect(201);
      const code2 = context.getVerifyCode();
      const verifyResp2 = await client.signupVerify({ token: resp2.body.token, code: code2 }).expect(200);
      const token2 = verifyResp2.body.token;
      await signupComplete(token2.substring(0, 32) + token2.substring(0, 68) + '00', 400);
      await signupComplete(token2.substring(0, 32) + token2.substring(0, 68) + '01', 400);
      await signupComplete(token2.substring(0, 32) + token2.substring(0, 68) + '02', 400);
      await signupComplete(token2, 201);
    });

    it('complete conflict', async () => {
      const resp = await client.signupEmailSend({ email: 'coml1@example.com' }).expect(201);
      const code = context.getVerifyCode();
      const verifyResp = await client.signupVerify({ token: resp.body.token, code }).expect(200);

      const resp2 = await client.signupEmailSend({ email: 'coml1@example.com' }).expect(201);
      const code2 = context.getVerifyCode();
      const verifyResp2 = await client.signupVerify({ token: resp2.body.token, code: code2 }).expect(200);

      await signupComplete(verifyResp2.body.token, 201);
      await signupComplete(verifyResp.body.token, 400);

      const resp3 = await client.signupSmsSend({ phoneNumber: '+8617700001204' }).expect(201);
      const code3 = context.getVerifyCode();
      const verifyResp3 = await client.signupVerify({ token: resp3.body.token, code: code3 }).expect(200);

      const resp4 = await client.signupSmsSend({ phoneNumber: '+8617700001204' }).expect(201);
      const code4 = context.getVerifyCode();
      const verifyResp4 = await client.signupVerify({ token: resp4.body.token, code: code4 }).expect(200);

      await signupComplete(verifyResp4.body.token, 201);
      await signupComplete(verifyResp3.body.token, 400);
    });
  });

  describe('user', () => {
    async function signupWith(
      email: string,
      phoneNumber: string,
      username: string,
      password: string,
      statusCode: number,
    ) {
      let token = '';
      if (email) {
        const resp = await client.signupEmailSend({ email }).expect(201);
        token = resp.body.token;
      } else if (phoneNumber) {
        const resp = await client.signupSmsSend({ phoneNumber }).expect(201);
        token = resp.body.token;
      }
      const code = context.getVerifyCode();
      const verifyResp = await client.signupVerify({ token: token, code: code }).expect(200);
      const body = {
        token: verifyResp.body.token,
        username: username,
        password: password,
      };
      await client.signupComplete(body).expect(statusCode);
    }

    async function signup(username: string, password: string, statusCode: number) {
      await signupWith(username + 'test@example.com', '', username, password, statusCode);
    }

    it('username contains only letters and numbers', async () => {
      const password = 'Aabcd123*&^';
      await signup('aA1234', password, 201);
      await signup('_aA1234', password, 400);
      await signup('aA1*234', password, 400);
      await signup('aA1-234', password, 400);
    });

    it('username should be unique', async () => {
      const password = 'Aabcd123*&^';
      await signupWith('aA1234ytest@example.com', '', 'aA1234y', password, 201);
      await signupWith('aA1234ytest2@example.com', '', 'aA1234y', password, 400);
    });

    it('email should be unique', async () => {
      const email = 'testxyzabce@example.com';
      const password = 'Aabcd123*&^';
      await signupWith(email, '', 'aA123411', password, 201);
      // await signupWith(email, '', 'aA123411xx', password, 400);
      const resp = await client.signupEmailSend({ email }).expect(201);
      const code = context.getVerifyCode();
      await client.signupVerify({ token: resp.body.token, code: code }).expect(400);
    });

    it('phone number should be unique', async () => {
      const phoneNumber = '+8617700001236';
      const password = 'Aabcd123*&^';
      await signupWith('', phoneNumber, 'aA123412', password, 201);
      // await signupWith('', phoneNumber, 'aA123412xx', password, 400);
      const resp = await client.signupSmsSend({ phoneNumber }).expect(201);
      const code = context.getVerifyCode();
      await client.signupVerify({ token: resp.body.token, code: code }).expect(400);
    });

    it('password should contains (uppercase letters && lowercase letters && (numbers || punctuation and special characters))', async () => {
      const username = 'aA1234x';
      await signup(username + '1', 'passwordABC123*&^', 201);
      await signup(username + '2', 'passwordABC123', 201);
      await signup(username + '3', 'passwordABC*&^', 201);
      await signup(username + '4', 'passwordABC*&^', 201);
      await signup(username + '5', 'password123*&^', 400);
      await signup(username + '6', 'ABC123*&^', 400);
      await signup(username + '7', 'ABC', 400);
    }, 100000);
  });
});
