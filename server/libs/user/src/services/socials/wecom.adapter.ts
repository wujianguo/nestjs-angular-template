import { HttpService } from '@nestjs/axios';
import { BadRequestException, HttpException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { ISocialAdapter, SocialUser } from '../../user-module-options.interface';

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
  logo: { en: string; zh: string } = { en: '', zh: '' };
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
    if (scope) {
      this.scope = scope;
    }
  }
  authorizationURL(req: Request): string {
    const userAgent = req.headers['user-agent']?.substring(0, 256) || '';
    console.log(userAgent);
    let url: URL;
    if (userAgent.indexOf(' wxwork/') > 0) {
      url = new URL(this.authWebURL);
      url.searchParams.append('state', 'wxwork');
    } else {
      url = new URL(this.authQrURL);
      url.searchParams.append('response_type', 'code');
      url.searchParams.append('scope', this.scope);
      url.searchParams.append('state', 'qr');
    }
    url.searchParams.append('appid', this.corpId);
    url.searchParams.append('redirect_uri', this.redirectURI);
    url.searchParams.append('agentid', this.agentId);
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
    return { name: user.name, identifier: user.userid, avatar: user.avatar, origin: user };
  }
}
