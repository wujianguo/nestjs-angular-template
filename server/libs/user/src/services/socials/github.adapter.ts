import { HttpService } from '@nestjs/axios';
import { HttpException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ISocialAdapter, SocialUser } from '../../user-module-options.interface';

type GithubToken = {
  access_token: string;
  token_type: string;
};

type GithubUser = {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
};

export class GithubAdapter implements ISocialAdapter {
  provider = 'github';
  name: { en: string; zh: string } = { en: 'Github', zh: 'Github' };
  logo: { en: string; zh: string } = { en: '', zh: '' };
  authBaseURL = 'https://github.com/login/oauth/authorize';
  tokenURL = 'https://github.com/login/oauth/access_token';
  userURL = 'https://api.github.com/user';

  constructor(
    private readonly httpService: HttpService,
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectURI?: string,
    public readonly scope?: string,
  ) {}

  authorizationURL(): string {
    const url = new URL(this.authBaseURL);
    url.searchParams.append('client_id', this.clientId);
    if (this.redirectURI) {
      url.searchParams.append('redirect_uri', this.redirectURI);
    }
    if (this.scope) {
      url.searchParams.append('scope', this.scope);
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
      if (state) {
        payload['state'] = state;
      }
      const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
      tokenResp = await firstValueFrom(
        this.httpService.post<GithubToken>(this.tokenURL, payload, { headers: headers }),
      );
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(err.response?.data || 'Internal server error', err.response?.status || 500);
    }
    let res;
    try {
      res = await firstValueFrom(
        this.httpService.get<GithubUser>(this.userURL, {
          headers: { Authorization: `Bearer ${tokenResp.data.access_token}` },
        }),
      );
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(err.response?.data || 'Internal server error', err.response?.status || 500);
    }
    return { name: res.data.name, identifier: res.data.login, avatar: res.data.avatar_url, origin: res.data };
  }
}
