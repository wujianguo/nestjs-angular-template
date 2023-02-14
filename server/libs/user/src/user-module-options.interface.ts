export interface UserModuleOptions {
  securityKey: string;

  deviceNumberLimit?: number;

  sendLimitTime?: number;

  codeExpireTime?: number;

  signupExpireTime?: number;

  codeVerifyMaxCount?: number;

  authLimitCount?: number;

  authLimitTime?: number;
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
  };
};
