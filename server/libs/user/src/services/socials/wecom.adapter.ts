import { HttpService } from '@nestjs/axios';
import { BadRequestException, HttpException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ISocialAdapter, SocialAuthURLOptions, SocialUser } from '../../user-module-options.interface';

type WecomAppToken = {
  errcode: number;
  errmsg: string;
  access_token: string;
  expires_in: number;
};

type WecomUserTicket = {
  errcode: number;
  errmsg: string;
  userid: string;
  user_ticket: string;
};

type WecomUser = {
  errcode: number;
  errmsg: string;
  userid: string;
  name: string;
  avatar: string;
};

export class WecomAdapter implements ISocialAdapter {
  provider = 'wecom';
  name: { en: string; zh: string } = { en: 'Wecom', zh: '企业微信' };
  iconURL: { en: string; zh: string } = { en: '', zh: '' };
  iconSVG: { en: string; zh: string } = { en: '', zh: '' };
  authQrURL = 'https://open.work.weixin.qq.com/wwopen/sso/qrConnect';
  authWebURL = 'https://open.weixin.qq.com/connect/oauth2/authorize';
  tokenURL = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken';
  userTicketURL = 'https://qyapi.weixin.qq.com/cgi-bin/auth/getuserinfo';
  userURL = 'https://qyapi.weixin.qq.com/cgi-bin/user/get';
  scope = 'snsapi_privateinfo';

  constructor(
    private readonly httpService: HttpService,
    private readonly agentId: string,
    private readonly corpId: string,
    private readonly appSecret: string,
    private readonly redirectURI: string,
    scope?: string,
  ) {
    // eslint-disable-next-line prettier/prettier
    const svg = '<svg t="1679550978842" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4042" width="100%" height="100%"><path d="M672.768 749.568c-2.56 2.56-4.096 6.656-4.096 10.752 0.512 4.096 2.56 7.68 5.632 9.728 28.672 27.136 47.616 62.976 52.736 102.4 7.168 27.136 33.792 44.544 61.44 40.448 27.648-4.096 48.128-28.16 47.616-55.808-0.512-28.16-22.016-51.2-49.664-54.272-36.352-6.656-69.632-25.6-94.72-52.736-5.12-5.632-13.824-5.632-18.944-0.512z m0 0" fill="#FB6500" p-id="4043"></path><path d="M898.048 661.504c-9.216 9.216-14.848 20.992-15.872 33.28-6.656 36.352-25.088 69.632-52.736 94.72-3.584 3.584-5.12 8.704-3.584 13.824 1.536 4.608 5.632 8.192 10.752 9.216 5.12 0.512 10.24-1.536 12.8-5.632 27.136-28.672 62.976-47.616 102.4-52.736 22.528-6.144 38.912-25.6 40.96-48.64 2.048-23.04-10.752-45.056-31.744-54.784-21.504-10.24-46.592-5.632-62.976 10.752z m0 0" fill="#0082EF" p-id="4044"></path><path d="M741.888 504.832c-14.848 15.36-19.968 37.376-12.8 57.856 7.168 19.968 25.088 34.304 46.592 36.864 36.352 6.656 69.632 25.088 94.72 52.736 3.584 3.584 8.704 5.12 13.824 3.584 4.608-1.536 8.192-5.632 9.216-10.752 0.512-5.12-1.536-10.24-5.632-12.8-28.672-27.136-47.616-62.976-52.736-102.4-5.12-18.944-20.48-33.792-39.424-38.912-19.456-5.632-39.936 0-53.76 13.824z m0 0" fill="#2DBC00" p-id="4045"></path><path d="M714.752 591.872l-1.024 1.024c-27.136 29.696-64 49.152-103.936 54.272-18.944 5.12-34.304 19.968-39.424 39.424-5.12 18.944 0.512 39.424 14.848 53.248 15.36 14.848 37.376 19.968 57.856 12.8 19.968-7.168 34.304-25.088 36.864-46.592 6.656-36.352 25.6-69.632 52.736-94.72 5.632-5.12 6.144-13.312 1.024-18.944-5.12-5.12-13.824-5.632-18.944-0.512z m0 0" fill="#FFCC00" p-id="4046"></path><path d="M379.392 112.64c-99.328 10.752-189.44 53.248-254.464 119.808-25.6 26.112-46.592 55.808-61.952 87.552-49.152 98.816-40.96 216.064 21.504 307.2 17.408 26.624 46.592 59.904 72.704 83.456l-11.776 94.208-1.536 4.096c-0.512 1.024-0.512 2.56-0.512 3.584l-0.512 3.072 0.512 3.072c1.024 10.24 7.168 19.456 16.384 24.064 9.216 4.608 20.48 4.608 29.184-1.024h0.512l2.048-1.536 28.672-14.336 84.992-43.008c40.448 11.776 82.432 17.408 124.416 16.896 52.224 0 103.936-8.704 152.576-26.624-24.576-8.192-40.448-32.256-37.888-57.856-50.688 16.384-104.448 21.504-157.184 15.36l-8.704-1.024c-18.944-2.56-37.888-6.656-56.32-11.776-10.24-3.072-20.992-2.048-30.208 3.072l-2.56 1.024-70.144 40.96-3.072 2.048c-1.536 1.024-2.56 1.536-3.072 1.536-2.56 0-4.608-2.56-4.608-5.12l2.56-10.752 3.072-11.776 5.12-19.456 5.632-21.504c4.096-12.288-0.512-25.088-10.752-32.768-27.648-20.48-51.712-45.568-70.656-73.728-49.152-71.68-55.808-164.352-17.408-242.176 12.8-25.088 29.184-48.64 49.664-69.632 53.248-54.784 128-89.6 210.432-98.816a402.56 402.56 0 0 1 86.016 0c82.432 9.216 156.672 45.056 209.408 99.328 20.48 20.992 36.864 45.056 49.152 70.144C747.008 384 755.2 419.328 755.2 455.68c0 3.584-0.512 7.68-0.512 11.264 22.016-13.312 50.176-10.24 68.096 8.192l2.56 3.072c4.096-54.272-6.144-108.544-30.208-157.696-15.872-32.256-36.352-61.44-61.44-87.552-66.048-67.072-155.648-110.08-251.904-119.808-33.792-3.584-68.096-4.096-102.4-0.512z m0 0" fill="#0082EF" p-id="4047"></path></svg>';
    this.iconSVG.en = svg;
    this.iconSVG.zh = svg;
    if (scope) {
      this.scope = scope;
    }
  }

  authorizationURL(options?: SocialAuthURLOptions): string {
    const userAgent = options?.userAgent || '';
    let url: URL;
    if (userAgent.indexOf(' wxwork/') > 0) {
      url = new URL(this.authWebURL);
    } else {
      url = new URL(this.authQrURL);
      url.searchParams.append('response_type', 'code');
      url.searchParams.append('scope', this.scope);
    }
    url.searchParams.append('appid', this.corpId);
    url.searchParams.append('redirect_uri', this.redirectURI);
    url.searchParams.append('agentid', this.agentId);
    if (options?.state) {
      url.searchParams.append('state', options.state);
    }
    return url.href;
  }

  async requestGet<T extends { errcode: number }>(url: string, params: any): Promise<T> {
    let res;
    try {
      res = await firstValueFrom(this.httpService.get<T>(url, { params }));
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(err.response?.data || 'Internal server error', err.response?.status || 500);
    }
    if (res.status !== 200 || res.data.errcode !== 0) {
      throw new BadRequestException(res.data);
    }
    return res.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async auth(code: string, state?: string): Promise<SocialUser> {
    const token = await this.requestGet<WecomAppToken>(this.tokenURL, {
      corpid: this.corpId,
      corpsecret: this.appSecret,
    });
    const userTicket = await this.requestGet<WecomUserTicket>(this.userTicketURL, {
      access_token: token.access_token,
      code: code,
    });
    const user = await this.requestGet<WecomUser>(this.userURL, {
      access_token: token.access_token,
      userid: userTicket.userid,
    });
    return { nickname: user.name, username: user.name, identifier: user.userid, avatar: user.avatar, origin: user };
  }
}
