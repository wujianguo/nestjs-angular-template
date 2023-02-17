import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { BadRequestException, HttpException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ISocialAdapter, SocialUser } from '../../user-module-options.interface';

type SlackUser = {
  ok: boolean;
  user: {
    name: string;
    id: string;
    email: string;
    image_72?: string;
    image_192?: string;
    image_512?: string;
  };
  team: {
    id: string;
    name: string;
    domain: string;
    image_230: string;
  };
  access_token: string;
};

export class SlackAdapter implements ISocialAdapter {
  provider = 'slack';
  name: { en: string; zh: string } = { en: 'Slack', zh: 'Slack' };
  logo: { en: string; zh: string } = { en: '', zh: '' };
  authBaseURL = 'https://slack.com/oauth/authorize';
  tokenURL = 'https://slack.com/api/oauth.access';
  scope = 'identity.basic,openid,profile';

  constructor(
    private readonly httpService: HttpService,
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectURI?: string,
    scope?: string,
  ) {
    if (scope) {
      this.scope = scope;
    }
  }

  authorizationURL(): string {
    const url = new URL(this.authBaseURL);
    url.searchParams.append('client_id', this.clientId);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', this.scope);
    if (this.redirectURI) {
      url.searchParams.append('redirect_uri', this.redirectURI);
    }
    return url.href;
  }

  async auth(code: string, state?: string): Promise<SocialUser> {
    let res;
    try {
      const payload: { [key: string]: string } = {};
      payload['client_id'] = this.clientId;
      payload['client_secret'] = this.clientSecret;
      payload['code'] = code;
      if (state) {
        payload['state'] = state;
      }
      const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
      res = await firstValueFrom(this.httpService.post<SlackUser>(this.tokenURL, payload, { headers: headers }));
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(err.response?.data || 'Internal server error', err.response?.status || 500);
    }
    if (res.status !== 200 || !res.data.ok) {
      throw new BadRequestException(res.data);
    }
    const avatar = res.data.user.image_512 || res.data.user.image_192 || res.data.user.image_72;
    return { name: res.data.user.name, identifier: res.data.user.id, avatar: avatar, origin: res.data };
  }
}
