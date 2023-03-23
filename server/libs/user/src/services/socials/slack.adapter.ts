import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { BadRequestException, HttpException } from '@nestjs/common';
import { ISocialAdapter, SocialAuthURLOptions, SocialUser } from '../../user-module-options.interface';

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
  iconURL: { en: string; zh: string } = { en: '', zh: '' };
  iconSVG: { en: string; zh: string } = { en: '', zh: '' };
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
    // eslint-disable-next-line prettier/prettier
    const svg = '<svg t="1679551011385" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5042" width="100%" height="100%"><path d="M244.224 643.84c0 59.221333-45.098667 107.264-100.778667 107.264C87.808 751.104 42.666667 703.061333 42.666667 643.84c0-59.221333 45.141333-107.264 100.778666-107.264h100.778667v107.264zM294.613333 643.84c0-59.306667 45.141333-107.306667 100.821334-107.306667 55.637333 0 100.778667 48.042667 100.778666 107.264v268.288c0 59.264-45.141333 107.306667-100.778666 107.306667-55.68 0-100.821333-48.042667-100.821334-107.306667v-268.288z" fill="#E01E5A" p-id="5043"></path><path d="M395.392 214.613333c-55.637333 0-100.778667-48.042667-100.778667-107.306666C294.613333 48.042667 339.754667 0 395.392 0c55.68 0 100.821333 48.042667 100.821333 107.306667V214.613333H395.392zM395.392 268.245333c55.68 0 100.821333 48.085333 100.821333 107.306667 0 59.306667-45.141333 107.306667-100.821333 107.306667H143.445333C87.808 482.858667 42.666667 434.816 42.666667 375.552c0-59.221333 45.141333-107.306667 100.778666-107.306667h251.946667z" fill="#36C5F0" p-id="5044"></path><path d="M798.549333 375.552c0-59.221333 45.098667-107.306667 100.778667-107.306667 55.637333 0 100.778667 48.085333 100.778667 107.306667 0 59.306667-45.141333 107.306667-100.778667 107.306667h-100.778667V375.552zM748.16 375.552c0 59.306667-45.141333 107.306667-100.821333 107.306667-55.637333 0-100.778667-48.042667-100.778667-107.306667V107.306667C546.56 48.042667 591.701333 0 647.338667 0c55.68 0 100.821333 48.042667 100.821333 107.306667v268.245333z" fill="#2EB67D" p-id="5045"></path><path d="M647.381333 804.778667c55.637333 0 100.778667 48.042667 100.778667 107.306666 0 59.264-45.141333 107.306667-100.778667 107.306667-55.68 0-100.821333-48.042667-100.821333-107.306667v-107.306666h100.821333zM647.381333 751.104c-55.68 0-100.821333-48.042667-100.821333-107.306667 0-59.221333 45.141333-107.306667 100.821333-107.306666h251.904c55.68 0 100.778667 48.085333 100.778667 107.306666 0 59.306667-45.098667 107.306667-100.778667 107.306667h-251.904z" fill="#ECB22E" p-id="5046"></path></svg>';
    this.iconSVG.en = svg;
    this.iconSVG.zh = svg;
    if (scope) {
      this.scope = scope;
    }
  }

  authorizationURL(options?: SocialAuthURLOptions): string {
    const url = new URL(this.authBaseURL);
    url.searchParams.append('client_id', this.clientId);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', this.scope);
    if (this.redirectURI) {
      url.searchParams.append('redirect_uri', this.redirectURI);
    }
    if (options?.state) {
      url.searchParams.append('state', options.state);
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
    return {
      nickname: res.data.user.name,
      username: res.data.user.name,
      identifier: res.data.user.id,
      avatar: avatar,
      origin: res.data,
    };
  }
}
