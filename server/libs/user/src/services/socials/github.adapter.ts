import { HttpService } from '@nestjs/axios';
import { HttpException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ISocialAdapter, SocialAuthURLOptions, SocialUser } from '../../user-module-options.interface';

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
  iconURL: { en: string; zh: string } = { en: '', zh: '' };
  iconSVG: { en: string; zh: string } = { en: '', zh: '' };
  authBaseURL = 'https://github.com/login/oauth/authorize';
  tokenURL = 'https://github.com/login/oauth/access_token';
  userURL = 'https://api.github.com/user';

  constructor(
    private readonly httpService: HttpService,
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectURI?: string,
    public readonly scope?: string,
  ) {
    // eslint-disable-next-line prettier/prettier
    const svg = '<svg t="1679543507152" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2745" width="100%" height="100%"><path d="M511.542857 14.057143C228.914286 13.942857 0 242.742857 0 525.142857 0 748.457143 143.2 938.285714 342.628571 1008c26.857143 6.742857 22.742857-12.342857 22.742858-25.371429v-88.571428c-155.085714 18.171429-161.371429-84.457143-171.771429-101.6C172.571429 756.571429 122.857143 747.428571 137.714286 730.285714c35.314286-18.171429 71.314286 4.571429 113.028571 66.171429 30.171429 44.685714 89.028571 37.142857 118.857143 29.714286 6.514286-26.857143 20.457143-50.857143 39.657143-69.485715-160.685714-28.8-227.657143-126.857143-227.657143-243.428571 0-56.571429 18.628571-108.571429 55.2-150.514286-23.314286-69.142857 2.171429-128.342857 5.6-137.142857 66.4-5.942857 135.428571 47.542857 140.8 51.771429 37.714286-10.171429 80.8-15.542857 129.028571-15.542858 48.457143 0 91.657143 5.6 129.714286 15.885715 12.914286-9.828571 76.914286-55.771429 138.628572-50.171429 3.314286 8.8 28.228571 66.628571 6.285714 134.857143 37.028571 42.057143 55.885714 94.514286 55.885714 151.2 0 116.8-67.428571 214.971429-228.571428 243.314286a145.714286 145.714286 0 0 1 43.542857 104v128.571428c0.914286 10.285714 0 20.457143 17.142857 20.457143 202.4-68.228571 348.114286-259.428571 348.114286-484.685714 0-282.514286-229.028571-511.2-511.428572-511.2z" p-id="2746"></path></svg>';
    this.iconSVG.en = svg;
    this.iconSVG.zh = svg;
  }

  authorizationURL(options?: SocialAuthURLOptions): string {
    const url = new URL(this.authBaseURL);
    url.searchParams.append('client_id', this.clientId);
    if (this.redirectURI) {
      url.searchParams.append('redirect_uri', this.redirectURI);
    }
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
    return {
      nickname: res.data.name,
      username: res.data.login,
      identifier: res.data.login,
      avatar: res.data.avatar_url,
      origin: res.data,
    };
  }
}
