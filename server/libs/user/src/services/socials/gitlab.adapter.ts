import { HttpService } from '@nestjs/axios';
import { HttpException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ISocialAdapter, SocialAuthURLOptions, SocialUser } from '../../user-module-options.interface';

type GitlabToken = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
};

type GitlabUser = {
  username: string;
  id: number;
  avatar_url: string;
  name: string;
};

export class GitlabAdapter implements ISocialAdapter {
  provider = 'gitlab';
  name: { en: string; zh: string } = { en: 'Gitlab', zh: 'Gitlab' };
  logo: { en: string; zh: string } = { en: '', zh: '' };
  authBaseURL = 'https://gitlab.com/oauth/authorize';
  tokenURL = 'https://gitlab.com/oauth/token';
  userURL = 'https://gitlab.com/api/v4/user';
  scope = 'read_user';
  constructor(
    private readonly httpService: HttpService,
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectURI: string,
    scope?: string,
    gitlabURL?: string,
  ) {
    if (scope) {
      this.scope = scope;
    }
    if (gitlabURL) {
      let url = gitlabURL;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      if (url.endsWith('/')) {
        url = url.slice(0, url.length - 1);
      }
      this.authBaseURL = `${url}/oauth/authorize`;
      this.tokenURL = `${url}/oauth/token`;
      this.userURL = `${url}/api/v4/user`;
    }
  }

  authorizationURL(options?: SocialAuthURLOptions): string {
    const url = new URL(this.authBaseURL);
    url.searchParams.append('client_id', this.clientId);
    url.searchParams.append('redirect_uri', this.redirectURI);
    url.searchParams.append('response_type', 'code');
    if (this.scope) {
      url.searchParams.append('scope', this.scope);
    }
    if (options?.state) {
      url.searchParams.append('state', options.state);
    }
    return url.href;
  }

  async auth(code: string, state?: string): Promise<SocialUser> {
    let tokenResp;
    try {
      const payload: { [key: string]: string } = {};
      payload['client_id'] = this.clientId;
      payload['client_secret'] = this.clientSecret;
      payload['code'] = code;
      payload['grant_type'] = 'authorization_code';
      payload['redirect_uri'] = this.redirectURI;
      if (state) {
        payload['state'] = state;
      }
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'gzip,deflate,compress',
      };
      tokenResp = await firstValueFrom(
        this.httpService.post<GitlabToken>(this.tokenURL, payload, { headers: headers }),
      );
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(err.response?.data || 'Internal server error', err.response?.status || 500);
    }
    let res;
    try {
      const headers = {
        Authorization: `Bearer ${tokenResp.data.access_token}`,
        'Accept-Encoding': 'gzip,deflate,compress',
      };
      res = await firstValueFrom(this.httpService.get<GitlabUser>(this.userURL, { headers: headers }));
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(err.response?.data || 'Internal server error', err.response?.status || 500);
    }
    return {
      nickname: res.data.name,
      username: res.data.name,
      identifier: res.data.username,
      avatar: res.data.avatar_url,
      origin: res.data,
    };
  }
}
