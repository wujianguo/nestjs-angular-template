import { HttpService } from '@nestjs/axios';
import { HttpException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ISocialAdapter, SocialUser } from '../../user-module-options.interface';

type DingtalkToken = {
  accessToken: string;
  refreshToken: string;
  expireIn: number;
  corpId: string;
};

type DingtalkUser = {
  unionId: string;
  nick: string;
  avatarUrl: string;
  openId: string;
};

export class DingtalkAdapter implements ISocialAdapter {
  provider = 'dingtalk';
  name: { en: string; zh: string } = { en: 'Dingtalk', zh: '钉钉' };
  logo: { en: string; zh: string } = { en: '', zh: '' };
  authBaseURL = 'https://login.dingtalk.com/oauth2/auth';
  tokenURL = 'https://api.dingtalk.com/v1.0/oauth2/userAccessToken';
  userURL = 'https://api.dingtalk.com/v1.0/contact/users/me';
  scope = 'openid';

  constructor(
    private readonly httpService: HttpService,
    private readonly appKey: string,
    private readonly appSecret: string,
    private readonly redirectURI: string,
    scope?: string,
  ) {
    if (scope) {
      this.scope = scope;
    }
  }
  authorizationURL(): string {
    const url = new URL(this.authBaseURL);
    url.searchParams.append('client_id', this.appKey);
    url.searchParams.append('redirect_uri', this.redirectURI);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', this.scope);
    url.searchParams.append('prompt', 'consent');
    return url.href;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async auth(code: string, state?: string): Promise<SocialUser> {
    let tokenResp;
    try {
      const payload: { [key: string]: string } = {};
      payload['clientId'] = this.appKey;
      payload['clientSecret'] = this.appSecret;
      payload['code'] = code;
      payload['grantType'] = 'authorization_code';
      const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
      tokenResp = await firstValueFrom(
        this.httpService.post<DingtalkToken>(this.tokenURL, payload, { headers: headers }),
      );
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(err.response?.data || 'Internal server error', err.response?.status || 500);
    }
    let res;
    try {
      const headers = { 'x-acs-dingtalk-access-token': tokenResp.data.accessToken, 'Content-Type': 'application/json' };
      res = await firstValueFrom(this.httpService.get<DingtalkUser>(this.userURL, { headers }));
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(err.response?.data || 'Internal server error', err.response?.status || 500);
    }
    return { name: res.data.nick, identifier: res.data.unionId, avatar: res.data.avatarUrl, origin: res.data };
  }
}
