import * as request from 'supertest';
import { SendEmailCodeRequest, SendSmsCodeRequest, VerifyCodeRequest } from '../../src/dto/mfa.dto';
import { SignupCompleteRequest } from '../../src/dto/signup.dto';
import { AuthenticatedUserResponse, UpdateUserRequest } from '../../src/dto/user.dto';
import { LoginRequest } from '../../src/dto/login.dto';
import { PasswordRequest } from '../../src/dto/password.dto';
import { AppContext } from './app';

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

  get(path: string, query: { [key: string]: any } = {}) {
    const uri = this.url(path, query);
    const req = request(this.context.app.getHttpServer()).get(uri);
    if (this.token) {
      return req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }

  post(path: string, query: { [key: string]: any } = {}, data: any = null) {
    const uri = this.url(path, query);
    const req = request(this.context.app.getHttpServer()).post(uri).send(data);
    if (this.token) {
      return req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }

  patch(path: string, query: { [key: string]: any } = {}, data: any = null) {
    const uri = this.url(path, query);
    const req = request(this.context.app.getHttpServer()).patch(uri).send(data);
    if (this.token) {
      return req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }

  delete(path: string, query: { [key: string]: any } = {}) {
    const uri = this.url(path, query);
    const req = request(this.context.app.getHttpServer()).delete(uri);
    if (this.token) {
      return req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
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

  profile() {
    return this.get('user/profile');
  }

  updateProfile(body: UpdateUserRequest) {
    return this.patch('user/profile', {}, body);
  }

  async register(username: string, recipient: string, password: string): Promise<AuthenticatedUserResponse> {
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
    // const respx = await this.signupComplete(body);
    // console.log(respx.body);
    const resp = await this.signupComplete(body).expect(201);
    return resp.body;
  }
}
