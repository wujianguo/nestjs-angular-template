import { ApiProperty } from '@nestjs/swagger';

class EmailAuthConfig {
  @ApiProperty()
  enable: boolean;

  @ApiProperty()
  domain: string;
}

class SmsAuthConfig {
  @ApiProperty()
  enable: boolean;

  @ApiProperty({ default: '+86' })
  prefix: string;
}

// export enum SocialAuthType {
//   Dingtalk = 'dingtalk',
//   Feishu = 'feishu',
//   Github = 'github',
//   Gitlab = 'gitlab',
//   Slack = 'slack',
//   Wecom = 'wecom',
// }

export class SocialAuthConfig {
  @ApiProperty()
  provider: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ format: 'url' })
  iconURL: string;

  @ApiProperty()
  iconSVG: string;

  @ApiProperty()
  authURL: string;
}

export class AuthConfig {
  @ApiProperty()
  email: EmailAuthConfig;

  @ApiProperty()
  sms: SmsAuthConfig;

  @ApiProperty({ type: [SocialAuthConfig] })
  socials: SocialAuthConfig[];
}

class AdminSocialAuthConfig {
  data: { [key: string]: any };
}

export class AdminAuthConfig {
  @ApiProperty()
  email: EmailAuthConfig;

  @ApiProperty()
  sms: SmsAuthConfig;

  @ApiProperty({ type: [SocialAuthConfig] })
  socials: AdminSocialAuthConfig[];

  @ApiProperty()
  deviceNumberLimit: number;

  @ApiProperty()
  sendLimitTime: number;

  @ApiProperty()
  codeExpireTime: number;

  @ApiProperty()
  signupExpireTime: number;

  @ApiProperty()
  codeVerifyMaxCount: number;

  @ApiProperty()
  securityKey: string;

  authLimitCount: number;

  authLimitTime: number;
}
