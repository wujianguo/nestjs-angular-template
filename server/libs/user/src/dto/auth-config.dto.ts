import { ApiProperty } from '@nestjs/swagger';

class EmailAuthConfig {
  @ApiProperty()
  enable: boolean;

  @ApiProperty()
  domain: string;
}

class PhoneAuthConfig {
  @ApiProperty()
  enable: boolean;
}

export enum SocialAuthType {
  Dingtalk = 'dingtalk',
  Feishu = 'feishu',
  Github = 'github',
  Gitlab = 'gitlab',
  Slack = 'slack',
  Wecom = 'wecom',
}

class SocialAuthConfig {
  @ApiProperty({ enum: SocialAuthType })
  type: SocialAuthType;

  @ApiProperty()
  name: string;

  @ApiProperty({ format: 'url' })
  logo: string;

  @ApiProperty({ format: 'url' })
  authURL: string;
}

export class AuthConfig {
  @ApiProperty()
  email: EmailAuthConfig;

  @ApiProperty()
  phone: PhoneAuthConfig;

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
  phone: PhoneAuthConfig;

  @ApiProperty({ type: [SocialAuthConfig] })
  socials: AdminSocialAuthConfig[];

  /**
   * unit: minutes
   */
  @ApiProperty()
  codeExpireTime: number;

  /**
   * unit: minutes
   */
  @ApiProperty()
  signupExpireTime: number;
}
