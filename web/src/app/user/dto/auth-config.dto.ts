
interface EmailAuthConfig {
  enable: boolean;

  domain: string;
}

interface SmsAuthConfig {
  enable: boolean;
  prefix: string;
}

export interface SocialAuthConfig {
  provider: string;

  name: string;

  iconSVG: string;

  iconURL: string;

  authURL: string;
}

export interface AuthConfig {
  email: EmailAuthConfig;

  sms: SmsAuthConfig;

  socials: SocialAuthConfig[];
}
