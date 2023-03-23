export interface SocialUser {
  identifier: string;
  username: string;
  nickname: string;
  avatar?: string;
  origin?: { [key: string]: any };
}

export type SocialAuthURLOptions = {
  userAgent: string;
  state?: string;
};

export interface ISocialAdapter {
  provider: string;
  name: { en: string; zh: string };
  iconURL: { en: string; zh: string };
  iconSVG: { en: string; zh: string };
  scope?: string;
  authorizationURL(options?: SocialAuthURLOptions): string;
  auth(code: string, state?: string): Promise<SocialUser>;
}

export interface SecurityOptions {
  securityKey: string;
}

export type TemplateKeys = 'signup' | 'signout' | 'resetpswd' | 'bind';

export interface EmailAuthOptions {
  enable: boolean;
  domain?: string;
  template?: { [key in TemplateKeys]: { subject: string; template?: string; text?: string; html?: string } };
}

export interface SmsAuthOptions {
  enable: boolean;
  prefix: string;
  template?: { [key in TemplateKeys]: string };
}

export interface GenericOAuth2App {
  provider: 'github' | 'gitlab' | 'slack';
  clientId: string;
  clientSecret: string;
  redirectURI?: string;
  scope?: string;
  logo?: string;
}

export interface GitlabApp extends GenericOAuth2App {
  /**
   * default: 'https://gitlab.com'
   */
  gitlabURL?: string;
}

export interface FeishuApp {
  provider: 'feishu';
  appId: string;
  appSecret: string;
  redirectURI: string;
  scope?: string;
  logo?: string;
}

export interface DingtalkApp {
  provider: 'dingtalk';
  appKey: string;
  appSecret: string;
  redirectURI: string;
  scope?: string;
  logo?: string;
}

export interface WecomApp {
  provider: 'wecom';
  agentId: string;
  corpId: string;
  appSecret: string;
  redirectURI: string;
  scope?: string;
  logo?: string;
}

export type SocialOptions = GenericOAuth2App | GitlabApp | FeishuApp | DingtalkApp | WecomApp | ISocialAdapter;

export interface UserModuleOptions {
  securityKey: string;

  deviceNumberLimit?: number;

  sendLimitTime?: number;

  codeExpireTime?: number;

  signupExpireTime?: number;

  codeVerifyMaxCount?: number;

  authLimitCount?: number;

  authLimitTime?: number;

  socials?: SocialOptions[];

  email?: EmailAuthOptions;

  sms?: SmsAuthOptions;
}

export interface UserModuleOptionsInternal {
  deviceNumberLimit: number;
  sendLimitTime: number;
  codeExpireTime: number;
  signupExpireTime: number;
  codeVerifyMaxCount: number;
  securityKey: string;
  authLimitCount: number;
  authLimitTime: number;
  socials: SocialOptions[];
  email: EmailAuthOptions;
  sms: SmsAuthOptions;
}

export const defaultOptions: UserModuleOptionsInternal = {
  deviceNumberLimit: 3,
  sendLimitTime: 60,
  codeExpireTime: 60,
  signupExpireTime: 60,
  codeVerifyMaxCount: 3,
  securityKey: '902hshqyjcoh5tyap2lx5uttt8m80tvg',
  authLimitCount: 3,
  authLimitTime: 5 * 60,
  socials: [],
  email: { enable: false, domain: '' },
  sms: { enable: false, prefix: '+86' },
};

export const USER_OPTIONS = 'USER_OPTIONS';

export const generateOptions = (options: UserModuleOptions): UserModuleOptionsInternal => {
  return {
    deviceNumberLimit: options.deviceNumberLimit || defaultOptions.deviceNumberLimit,
    sendLimitTime: options.sendLimitTime || defaultOptions.sendLimitTime,
    codeExpireTime: options.codeExpireTime || defaultOptions.codeExpireTime,
    signupExpireTime: options.signupExpireTime || defaultOptions.signupExpireTime,
    codeVerifyMaxCount: options.codeVerifyMaxCount || defaultOptions.codeVerifyMaxCount,
    authLimitCount: options.authLimitCount || defaultOptions.authLimitCount,
    authLimitTime: options.authLimitTime || defaultOptions.authLimitTime,
    securityKey: options.securityKey,
    socials: options.socials || defaultOptions.socials,
    email: options.email || defaultOptions.email,
    sms: options.sms || defaultOptions.sms,
  };
};
