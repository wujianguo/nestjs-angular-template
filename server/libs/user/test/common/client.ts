import * as request from 'supertest';
import { SendEmailCodeRequest, SendSmsCodeRequest, VerifyCodeRequest } from '../../src/dto/mfa.dto';
import { SignupCompleteRequest } from '../../src/dto/signup.dto';
import { AuthenticatedUserResponse, UpdateUserRequest } from '../../src/dto/user.dto';
import { LoginRequest } from '../../src/dto/login.dto';
import { ChangePasswordRequest, PasswordRequest, ResetPasswordRequest } from '../../src/dto/password.dto';
import { AppContext } from './app';
import { SocialAuthCode } from '../../src/dto/social.dto';

export class UserClient {
  private context: AppContext;
  private user: AuthenticatedUserResponse;
  private token = '';

  constructor(context: AppContext) {
    this.context = context;
  }

  setCurrentUser(user: AuthenticatedUserResponse) {
    this.user = user;
  }

  getCurrentUser() {
    return this.user;
  }

  setToken(token: string) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  url(path: string, query: { [key: string]: any } = {}) {
    const prefix = path.startsWith('/') ? '' : '/';
    return `${prefix}${path}?${new URLSearchParams(query).toString()}`;
  }

  setRequestToken(req: request.Request, token = '') {
    if (token) {
      return req.set('Authorization', `Bearer ${token}`);
    } else if (this.token) {
      return req.set('Authorization', `Bearer ${this.token}`);
    }
  }

  get(path: string, query: { [key: string]: any } = {}, token = '') {
    const uri = this.url(path, query);
    const req = request(this.context.app.getHttpServer()).get(uri);
    this.setRequestToken(req, token);
    return req;
  }

  post(path: string, query: { [key: string]: any } = {}, data: any = null, token = '') {
    const uri = this.url(path, query);
    const req = request(this.context.app.getHttpServer()).post(uri).send(data);
    this.setRequestToken(req, token);
    return req;
  }

  patch(path: string, query: { [key: string]: any } = {}, data: any = null, token = '') {
    const uri = this.url(path, query);
    const req = request(this.context.app.getHttpServer()).patch(uri).send(data);
    this.setRequestToken(req, token);
    return req;
  }

  delete(path: string, query: { [key: string]: any } = {}, token = '') {
    const uri = this.url(path, query);
    const req = request(this.context.app.getHttpServer()).delete(uri);
    this.setRequestToken(req, token);
    return req;
  }

  authConfig() {
    return this.get('auth/config');
  }

  signupEmailSend(body: SendEmailCodeRequest) {
    return this.post('auth/signup/email/send', {}, body);
  }

  signupSmsSend(body: SendSmsCodeRequest) {
    return this.post('auth/signup/sms/send', {}, body);
  }

  signupVerify(body: VerifyCodeRequest) {
    return this.post('auth/signup/verify', {}, body);
  }

  signupComplete(body: SignupCompleteRequest) {
    return this.post('auth/signup/complete', {}, body);
  }

  signoutEmailSend(body: PasswordRequest) {
    return this.post('auth/signout/email/send', {}, body);
  }

  signoutSmsSend(body: PasswordRequest) {
    return this.post('auth/signout/sms/send', {}, body);
  }

  signoutComplete(body: VerifyCodeRequest) {
    return this.post('auth/signout/complete', {}, body);
  }

  login(body: LoginRequest) {
    return this.post('auth/login', {}, body);
  }

  logout() {
    return this.delete('auth/logout');
  }

  profile(token?: string) {
    return this.get('user/profile', {}, token);
  }

  updateProfile(body: UpdateUserRequest) {
    return this.patch('user/profile', {}, body);
  }

  async changeRecipient(recipient: string, statusCode = 204): Promise<void> {
    if (recipient[0] === '+') {
      const resp = await this.post('user/profile/sms/change/send', {}, { phoneNumber: recipient }).expect(201);
      const bindToken = resp.body.token;
      const code = this.context.getVerifyCode();
      await this.post('user/profile/sms/change', {}, { token: bindToken, code }).expect(statusCode);
    } else if (recipient.indexOf('@') >= 0) {
      const resp = await this.post('user/profile/email/change/send', {}, { email: recipient }).expect(201);
      const bindToken = resp.body.token;
      const code = this.context.getVerifyCode();
      await this.post('user/profile/email/change', {}, { token: bindToken, code }).expect(statusCode);
    } else {
      expect(false).toBe(true);
    }
  }

  changePassword(body: ChangePasswordRequest) {
    return this.post('auth/password/change', {}, body);
  }

  resetPswdEmailSend(body: SendEmailCodeRequest) {
    return this.post('auth/password/reset/email/send', {}, body);
  }

  resetPswdSmsSend(body: SendSmsCodeRequest) {
    return this.post('auth/password/reset/sms/send', {}, body);
  }

  resetPswdComplete(body: ResetPasswordRequest) {
    return this.post('auth/password/reset/complete', {}, body);
  }

  socialAuthURL(provider: string) {
    return this.get(`auth/social/${provider}/url`);
  }

  socialAuth(provider: string, body: SocialAuthCode) {
    return this.post(`auth/social/${provider}/auth`, {}, body);
  }

  socialConnections(token?: string) {
    return this.get('auth/social/connections', {}, token);
  }

  socialConnect(provider: string, body: SocialAuthCode, token?: string) {
    return this.post(`auth/social/${provider}/connect`, {}, body, token);
  }

  socialDisconnect(provider: string, token?: string) {
    return this.delete(`auth/social/${provider}/disconnect`, {}, token);
  }

  async register(
    username: string,
    recipient: string,
    password: string,
    statusCode = 201,
  ): Promise<AuthenticatedUserResponse> {
    let token = '';
    if (recipient[0] === '+') {
      token = (await this.signupSmsSend({ phoneNumber: recipient })).body.token;
    } else if (recipient.indexOf('@') >= 0) {
      token = (await this.signupEmailSend({ email: recipient })).body.token;
    }

    const code = this.context.getVerifyCode();
    const verifyResp = await this.signupVerify({ token: token, code: code }).expect(200);
    const body = {
      token: verifyResp.body.token,
      username: username,
      password: password,
    };
    const resp = await this.signupComplete(body).expect(statusCode);
    return resp.body;
  }

  async signout(login: string, password: string, statusCode = 204) {
    const client = new UserClient(this.context);
    const resp1 = await client.login({ login, password }).expect(200);
    const accessToken = resp1.body.token;
    client.setToken(accessToken);
    let resp: request.Response;
    if (resp1.body.email) {
      resp = await client.signoutEmailSend({ password }).expect(201);
    } else if (resp1.body.phoneNumber) {
      resp = await client.signoutSmsSend({ password }).expect(201);
    } else {
      console.error(resp1.body);
      expect(false).toBe(true);
      return;
    }
    const token = resp.body.token;
    const code = this.context.getVerifyCode();
    await client.signoutComplete({ token, code }).expect(statusCode);
  }
}
