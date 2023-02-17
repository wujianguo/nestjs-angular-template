import { HttpService } from '@nestjs/axios';
import { BadRequestException, HttpException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ISocialAdapter, SocialUser } from '../../user-module-options.interface';

type FeishuAppToken = {
  code: number;
  msg: string;
  app_access_token: string;
  expire: number;
};

type FeishuUser = {
  code: number;
  msg: string;
  data: {
    open_id: string;
    user_id: string;
    union_id: string;
    avatar_big: string;
    name: string;
  };
};

export class FeishuAdapter implements ISocialAdapter {
  provider = 'feishu';
  name: { en: string; zh: string } = { en: 'Feishu', zh: '飞书' };
  logo: { en: string; zh: string } = { en: '', zh: '' };
  authBaseURL = 'https://open.feishu.cn/open-apis/authen/v1/index';
  appTokenURL = 'https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal';
  tokenURL = 'https://open.feishu.cn/open-apis/authen/v1/access_token';

  constructor(
    private readonly httpService: HttpService,
    private readonly appId: string,
    private readonly appSecret: string,
    private readonly redirectURI: string,
  ) {}

  authorizationURL(): string {
    const url = new URL(this.authBaseURL);
    url.searchParams.append('app_id', this.appId);
    url.searchParams.append('redirect_uri', this.redirectURI);
    return url.href;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async auth(code: string, state?: string): Promise<SocialUser> {
    let tokenResp;
    try {
      const payload: { [key: string]: string } = {};
      payload['app_id'] = this.appId;
      payload['app_secret'] = this.appSecret;
      const headers = { 'Content-Type': 'application/json; charset=utf-8' };
      tokenResp = await firstValueFrom(
        this.httpService.post<FeishuAppToken>(this.appTokenURL, payload, { headers: headers }),
      );
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(err.response?.data || 'Internal server error', err.response?.status || 500);
    }
    if (tokenResp.data.code !== 0) {
      throw new BadRequestException(tokenResp.data);
    }
    let res;
    try {
      const payload = {
        code: code,
        grant_type: 'authorization_code',
      };
      const headers = {
        Authorization: `Bearer ${tokenResp.data.app_access_token}`,
        'Content-Type': 'application/json; charset=utf-8',
      };
      res = await firstValueFrom(this.httpService.post<FeishuUser>(this.tokenURL, payload, { headers: headers }));
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(err.response?.data || 'Internal server error', err.response?.status || 500);
    }
    if (res.data.code !== 0) {
      throw new BadRequestException(tokenResp.data);
    }
    return {
      name: res.data.data.name,
      identifier: res.data.data.union_id,
      avatar: res.data.data.avatar_big,
      origin: res.data,
    };
  }
}
