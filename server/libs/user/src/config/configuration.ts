import { AdminAuthConfig } from '../dto/auth-config.dto';

export const parseConfig = (conf: Record<string, any>): AdminAuthConfig => {
  return {
    email: {
      enable: true,
      domain: '',
    },
    sms: {
      enable: true,
    },
    socials: [],
    sendLimitTime: 60,
    codeExpireTime: 60,
    signupExpireTime: 60,
    codeVerifyMaxCount: 3,
    securityKey: '902hshqyjcoh5tyap2lx5uttt8m80tvg',
  };
};
