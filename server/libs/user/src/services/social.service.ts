import { Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SocialAuthConfig } from '../dto/auth-config.dto';
import { UserModuleOptionsInternal, USER_OPTIONS } from '../user-module-options.interface';
import { ISocialAdapter, SocialUser } from '../user-module-options.interface';
import { SlackAdapter } from './socials/slack.adapter';
import { GithubAdapter } from './socials/github.adapter';
import { GitlabAdapter } from './socials/gitlab.adapter';
import { FeishuAdapter } from './socials/feishu.adapter';
import { DingtalkAdapter } from './socials/dingtalk.adapter';
import { WecomAdapter } from './socials/wecom.adapter';

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);
  adapters: { [key: string]: ISocialAdapter } = {};

  constructor(
    @Inject(USER_OPTIONS) private readonly config: UserModuleOptionsInternal,
    private readonly httpService: HttpService,
  ) {
    for (let index = 0; index < this.config.socials.length; index++) {
      const element = this.config.socials[index];
      let scope = '';
      if ('scope' in element) {
        scope = element.scope || scope;
      }
      if (element.provider === 'slack' && 'clientId' in element && 'clientSecret' in element) {
        this.adapters[element.provider] = new SlackAdapter(
          this.httpService,
          element.clientId,
          element.clientSecret,
          scope,
        );
      } else if (element.provider === 'github' && 'clientId' in element && 'clientSecret' in element) {
        this.adapters[element.provider] = new GithubAdapter(
          this.httpService,
          element.clientId,
          element.clientSecret,
          scope,
        );
      } else if (
        element.provider === 'gitlab' &&
        'clientId' in element &&
        'clientSecret' in element &&
        'redirectURI' in element
      ) {
        let gitlabURL = '';
        if ('gitlabURL' in element) {
          gitlabURL = element.gitlabURL || gitlabURL;
        }
        this.adapters[element.provider] = new GitlabAdapter(
          this.httpService,
          element.clientId,
          element.clientSecret,
          element.redirectURI || '',
          scope,
          gitlabURL,
        );
      } else if (element.provider === 'feishu') {
        if ('appId' in element && 'appSecret' in element && 'redirectURI' in element) {
          this.adapters[element.provider] = new FeishuAdapter(
            this.httpService,
            element.appId,
            element.appSecret,
            element.redirectURI,
          );
        }
      } else if (element.provider === 'dingtalk') {
        if ('appKey' in element && 'appSecret' in element && 'redirectURI' in element) {
          this.adapters[element.provider] = new DingtalkAdapter(
            this.httpService,
            element.appKey,
            element.appSecret,
            element.redirectURI,
            scope,
          );
        }
      } else if (element.provider === 'wecom') {
        if ('agentId' in element && 'corpId' in element && 'appSecret' in element && 'redirectURI' in element) {
          this.adapters[element.provider] = new WecomAdapter(
            this.httpService,
            element.agentId,
            element.corpId,
            element.appSecret,
            element.redirectURI,
            scope,
          );
        }
      } else {
        this.adapters[element.provider] = element as ISocialAdapter;
      }
    }
  }

  getPublicSocialAuthConfig(language: 'en' | 'zh' = 'en'): SocialAuthConfig[] {
    const ret = Object.keys(this.adapters).map((key) => {
      const conf = new SocialAuthConfig();
      conf.provider = this.adapters[key].provider;
      if (language === 'en') {
        conf.name = this.adapters[key].name.en;
        conf.iconURL = this.adapters[key].iconURL.en;
        conf.iconSVG = this.adapters[key].iconSVG.en;
      } else if (language === 'zh') {
        conf.name = this.adapters[key].name.zh;
        conf.iconURL = this.adapters[key].iconURL.zh;
        conf.iconSVG = this.adapters[key].iconSVG.zh;
      }
      // conf.authURL = this.adapters[key].authorizationURL();
      return conf;
    });
    return ret;
  }

  authorizationURL(provider: string, userAgent: string, state?: string): string {
    return this.adapters[provider].authorizationURL({ userAgent, state });
  }

  async auth(provider: string, code: string, state?: string): Promise<SocialUser> {
    return await this.adapters[provider].auth(code, state);
  }
}
