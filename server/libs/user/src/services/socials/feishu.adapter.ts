import { HttpService } from '@nestjs/axios';
import { BadRequestException, HttpException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ISocialAdapter, SocialAuthURLOptions, SocialUser } from '../../user-module-options.interface';

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
  iconURL: { en: string; zh: string } = { en: '', zh: '' };
  iconSVG: { en: string; zh: string } = { en: '', zh: '' };
  authBaseURL = 'https://open.feishu.cn/open-apis/authen/v1/index';
  appTokenURL = 'https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal';
  tokenURL = 'https://open.feishu.cn/open-apis/authen/v1/access_token';

  constructor(
    private readonly httpService: HttpService,
    private readonly appId: string,
    private readonly appSecret: string,
    private readonly redirectURI: string,
  ) {
    // eslint-disable-next-line prettier/prettier
    const svg = '<svg t="1679550917078" class="icon" viewBox="0 0 1301 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2179" width="100%" height="100%"><path d="M1066.00594089 331.39030191a145.80443299 145.80443299 0 0 1 15.31130302 0.89826334 429.24726975 429.24726975 0 0 1 113.99775237 31.48003812c10.57500632 4.73629669 13.1881355 8.57432922 4.08301418 18.1285826a367.87956812 367.87956812 0 0 0-63.85834038 94.23596475c-17.55696094 36.95127731-36.7471269 73.12678171-54.71238868 109.91473903a235.83489312 235.83489312 0 0 1-54.58989743 72.67765044c-56.18227368 50.8335249-121.67381909 72.26934878-196.39297704 61.89849371-85.74329553-11.88157132-166.95444563-40.83014108-243.67428068-79.00632257-4.77712627-2.36814834-8.16602838-4.08301418-10.98330798-5.79788003a5.5528992 5.5528992 0 0 1 0.32664166-9.59508298l5.30791837-2.85811001c62.14347456-33.19490479 113.99775321-79.45545383 163.97384518-128.08415122 21.10918304-20.41507012 41.36093234-41.85089402 62.67426581-62.10264413a361.26508557 361.26508557 0 0 1 167.77104813-89.82630973c13.80058759-3.30724128 27.7236656-6.00203046 41.605914-8.98263089h0.65328168l29.56102267-2.7356196" fill="#133c9a" p-id="2180"></path><path d="M465.3945705 931.3483898c-9.43176215-0.53079209-32.6641127-3.71554294-35.44056271-4.08301419a561.65941598 561.65941598 0 0 1-172.87481607-50.54771365c-31.60252936-14.78051092-62.02098413-32.21498144-92.52109891-49.20031989-20.04759888-11.1874584-29.15272019-28.58109851-28.94856976-52.1809195q0.97992334-130.94226123 0-261.9253537C135.2828822 457.22879519 133.64967637 401.04652152 132.79224344 344.90507825a45.40311611 45.40311611 0 0 1 2.32731793-14.5763605c3.38890128-10.12587505 10.3708559-10.73832714 17.2711497-4.08301337 7.96187714 7.67606671 14.29054925 16.98533844 22.17076638 24.49808432 70.55448293 69.4928996 145.31447131 133.14708875 229.13874976 185.5729899a1262.71293283 1262.71293283 0 0 0 146.98850674 80.96616842c81.45613091 36.99210773 164.95376853 69.61539002 252.45276032 90.3162714 77.29145672 18.29190344 152.45974595 6.77780337 215.09318216-42.30002528 19.10850595-16.33205594 28.58109851-28.29528726 51.24182656-58.46876201a376.82136941 376.82136941 0 0 1-39.15610564 76.27070296c-14.5763605 22.9465393-47.40379321 53.5691445-72.43266963 77.57726798-38.01286065 36.7471269-87.70314221 66.55312958-134.3311625 91.70449557-50.8335249 27.39702475-103.66772772 49.28197988-160.13581265 61.24521122-28.94856976 7.22693464-70.75863418 15.51545343-85.17167304 16.33205676-2.53146835-0.20415042-11.14662881 1.75569626-15.55628384 1.38822418-37.19625815 2.81727961-60.14279746 3.87886377-97.29822519 0z" fill="#3370ff" p-id="2181"></path><path d="M305.6262291 90.28832082a54.91653909 54.91653909 0 0 1 7.79855713 0c159.890831 0 318.4750978 2.57229878 478.16177838 2.57229878a1.34739458 1.34739458 0 0 1 0.77577292 0.24498083 376.61721817 376.61721817 0 0 1 41.1159515 42.01421485c36.05301398 35.84886355 62.91924665 97.99233811 81.2928101 135.88270834 9.14595172 26.17212058 22.9465393 51.20099615 29.47936185 80.35371717v0.53079125a349.38351426 349.38351426 0 0 0-47.52628365 19.35348679c-46.17888904 23.43650098-67.16558167 40.54432984-105.50508397 78.31221048-20.86420222 20.41507012-38.70697357 38.82946399-66.43063916 64.96075416-8.69681963 8.16602838-30.82675644 28.86690976-31.19422769 28.21362725-7.34942505-12.98398507-131.63637414-256.12747283-381.31268445-447.41668277" fill="#00d6b9" p-id="2182"></path></svg>';
    this.iconSVG.en = svg;
    this.iconSVG.zh = svg;
  }

  authorizationURL(options?: SocialAuthURLOptions): string {
    const url = new URL(this.authBaseURL);
    url.searchParams.append('app_id', this.appId);
    url.searchParams.append('redirect_uri', this.redirectURI);
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
      payload['app_id'] = this.appId;
      payload['app_secret'] = this.appSecret;
      const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Accept-Encoding': 'gzip,deflate,compress' };
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
        'Accept-Encoding': 'gzip,deflate,compress',
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
      nickname: res.data.data.name,
      username: res.data.data.name,
      identifier: res.data.data.union_id,
      avatar: res.data.data.avatar_big,
      origin: res.data,
    };
  }
}
