import { AppContext } from './common/app';
import { UserClient } from './common/client';

describe('Signup', () => {
  let context: AppContext;
  let client: UserClient;
  const password = 'passworD123*x';

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
    const username = 'username123';

    it('email', async () => {
      const email = 'test@example.com';
      const resp = await client.register(username, email, password);
      expect(resp.email?.length).toBeGreaterThan(0);
      await client.signout(username, password);
    });

    it('phone number', async () => {
      const phoneNumber = '+8617200001234';
      const resp = await client.register(username, phoneNumber, password);
      expect(resp.phoneNumber?.length).toBeGreaterThan(0);
      await client.signout(username, password);
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
        firstName: 'First',
        lastName: 'Last',
      };
      await client.signupComplete(body).expect(statusCode);
    }

    it('send too often', async () => {
      const email = 'test1@example.com';
      await client.signupEmailSend({ email }).expect(201);
      await client.signupEmailSend({ email }).expect(429);
      await new Promise((r) => setTimeout(r, 3000));
      await client.signupEmailSend({ email }).expect(201);
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
    it('username contains only letters and numbers', async () => {
      const email = 'aA1234ytest0@example.com';
      await client.register('aA1234y', email, password, 201);
      await client.register('_aA1234', '1' + email, password, 400);
      await client.register('aA1*234', '2' + email, password, 400);
      await client.register('aA1-234', '3' + email, password, 400);
    });

    it('username should be unique', async () => {
      await client.register('aA1234y1', 'aA1234ytest1@example.com', password, 201);
      await client.register('aA1234y1', 'aA1234ytest2@example.com', password, 400);
    });

    it('email should be unique', async () => {
      const email = 'aA1234ytest3@example.com';
      await client.register('aA1234y2', email, password, 201);
      const resp = await client.signupEmailSend({ email }).expect(201);
      const code = context.getVerifyCode();
      await client.signupVerify({ token: resp.body.token, code: code }).expect(400);
    });

    it('phone number should be unique', async () => {
      const phoneNumber = '+8617700001236';
      await client.register('aA1234y24', phoneNumber, password, 201);
      const resp = await client.signupSmsSend({ phoneNumber }).expect(201);
      const code = context.getVerifyCode();
      await client.signupVerify({ token: resp.body.token, code: code }).expect(400);
    });

    it('password should contains (uppercase letters && lowercase letters && (numbers || punctuation and special characters))', async () => {
      const username = 'aA1234y';
      const email = 'aA1234ytest01@example.com';
      await client.register(username + '10', '10' + email, 'abcABC123*&^', 201);
      await client.register(username + '11', '11' + email, 'abcABC123', 201);
      await client.register(username + '12', '12' + email, 'abcABC*&^', 201);
      await client.register(username + '13', '13' + email, 'ABC123*&^', 400);
      await client.register(username + '14', '14' + email, 'abc123*&^', 400);
      await client.register(username + '15', '15' + email, '123*&^', 400);
      await client.register(username + '15', '15' + email, 'abcdefg', 400);
      await client.register(username + '15', '15' + email, 'ABCDEFG', 400);
      await client.register(username + '15', '15' + email, '1234567', 400);
      await client.register(username + '15', '15' + email, '*******', 400);
      await client.register(username + '15', '15' + email, 'aA1', 400);
    }, 100000);
  });
});
