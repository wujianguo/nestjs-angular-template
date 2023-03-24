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
  iconURL: { en: string; zh: string } = { en: '', zh: '' };
  iconSVG: { en: string; zh: string } = { en: '', zh: '' };
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
    // eslint-disable-next-line prettier/prettier
    const svg = '<svg t="1679549867756" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2789" width="100%" height="100%"><path d="M932.317184 567.76704L885.10464 422.46144l-93.57312-287.997952c-4.8128-14.81728-25.776128-14.81728-30.590976 0L667.36128 422.459392H356.62848L263.051264 134.46144c-4.8128-14.81728-25.776128-14.81728-30.593024 0l-93.57312 287.997952-47.210496 145.309696a32.165888 32.165888 0 0 0 11.68384 35.96288l408.6272 296.890368L920.61696 603.734016c11.272192-8.192 15.990784-22.71232 11.68384-35.964928" fill="#FC6D26" p-id="2790"></path><path d="M512.002048 900.62848l155.365376-478.171136H356.634624z" fill="#E24329" p-id="2791"></path><path d="M512.004096 900.62848L356.63872 422.47168H138.901504z" fill="#FC6D26" p-id="2792"></path><path d="M138.891264 422.465536l-47.214592 145.309696a32.16384 32.16384 0 0 0 11.685888 35.96288L511.991808 900.62848z" fill="#FCA326" p-id="2793"></path><path d="M138.893312 422.459392h217.737216L263.053312 134.46144c-4.8128-14.819328-25.778176-14.819328-30.590976 0z" fill="#E24329" p-id="2794"></path><path d="M512.002048 900.62848l155.365376-478.154752H885.10464z" fill="#FC6D26" p-id="2795"></path><path d="M885.11488 422.465536l47.214592 145.309696a32.16384 32.16384 0 0 1-11.685888 35.96288L512.014336 900.62848z" fill="#FCA326" p-id="2796"></path><path d="M885.096448 422.459392H667.36128l93.577216-287.997952c4.814848-14.819328 25.778176-14.819328 30.590976 0z" fill="#E24329" p-id="2797"></path></svg>';
    this.iconSVG.en = svg;
    this.iconSVG.zh = svg;

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
      username: res.data.username,
      identifier: res.data.username,
      avatar: res.data.avatar_url,
      origin: res.data,
    };
  }
}
