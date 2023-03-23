import { HttpService } from '@nestjs/axios';
import { HttpException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ISocialAdapter, SocialAuthURLOptions, SocialUser } from '../../user-module-options.interface';

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
  iconURL: { en: string; zh: string } = { en: '', zh: '' };
  iconSVG: { en: string; zh: string } = { en: '', zh: '' };
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
    // eslint-disable-next-line prettier/prettier
    const svg = '<svg t="1679549960235" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3305" width="100%" height="100%"><path d="M512.003 79C272.855 79 79 272.855 79 512.003 79 751.145 272.855 945 512.003 945 751.145 945 945 751.145 945 512.003 945 272.855 751.145 79 512.003 79z m200.075 375.014c-0.867 3.764-3.117 9.347-6.234 16.012h0.087l-0.347 0.648c-18.183 38.86-65.631 115.108-65.631 115.108l-0.215-0.52-13.856 24.147h66.8L565.063 779l29.002-115.368h-52.598l18.27-76.29c-14.76 3.55-32.253 8.436-52.945 15.1 0 0-27.967 16.36-80.607-31.5 0 0-35.501-31.29-14.891-39.078 8.744-3.33 42.466-7.573 69.004-11.122 35.93-4.845 57.965-7.441 57.965-7.441s-110.607 1.643-136.841-2.468c-26.237-4.11-59.525-47.905-66.626-86.377 0 0-10.953-21.117 23.595-11.122 34.547 10 177.535 38.95 177.535 38.95s-185.933-56.992-198.36-70.929c-12.381-13.846-36.406-75.902-33.289-113.981 0 0 1.343-9.521 11.127-6.926 0 0 137.49 62.75 231.475 97.152 94.028 34.403 175.76 51.885 165.2 96.414z" fill="#3AA2EB" p-id="3306"></path></svg>';
    this.iconSVG.en = svg;
    this.iconSVG.zh = svg;

    if (scope) {
      this.scope = scope;
    }
  }

  authorizationURL(options?: SocialAuthURLOptions): string {
    const url = new URL(this.authBaseURL);
    url.searchParams.append('client_id', this.appKey);
    url.searchParams.append('redirect_uri', this.redirectURI);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', this.scope);
    url.searchParams.append('prompt', 'consent');
    if (options?.state) {
      url.searchParams.append('state', options.state);
    }
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
    return {
      nickname: res.data.nick,
      username: res.data.nick,
      identifier: res.data.unionId,
      avatar: res.data.avatarUrl,
      origin: res.data,
    };
  }
}
