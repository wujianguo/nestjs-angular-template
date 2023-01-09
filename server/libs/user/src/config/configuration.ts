import { AdminAuthConfig } from '../dto/auth-config.dto';

export const parseConfig = (conf: Record<string, any>): AdminAuthConfig => {
  return {
    email: {
      enable: true,
      domain: '',
    },
    phone: {
      enable: true,
    },
    socials: [],
    codeExpireTime: 60,
    signupExpireTime: 60,
  };
};
