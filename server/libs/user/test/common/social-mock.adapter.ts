import { BadRequestException } from '@nestjs/common';
import { ISocialAdapter, SocialAuthURLOptions, SocialUser } from '../../src/user-module-options.interface';

export class MockAdapter implements ISocialAdapter {
  provider = 'mock';
  name: { en: string; zh: string } = { en: 'Mock', zh: 'Mock' };
  iconURL: { en: string; zh: string } = { en: '', zh: '' };
  iconSVG: { en: string; zh: string } = { en: '', zh: '' };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  authorizationURL(options?: SocialAuthURLOptions): string {
    return '';
  }

  async auth(code: string, state?: string): Promise<SocialUser> {
    let identifier = '';
    if (code.startsWith('s-')) {
      identifier = code.slice(2);
    } else {
      throw new BadRequestException(code);
    }
    const origin = { code: code, state: state || '' };
    return { nickname: 'name', username: 'username', identifier, avatar: '', origin: origin };
  }
}
