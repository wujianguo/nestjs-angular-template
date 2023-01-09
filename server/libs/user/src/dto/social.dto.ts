import { ApiProperty } from '@nestjs/swagger';
import { SocialAuthType } from './auth-config.dto';
import { AuthenticatedUserResponse } from './user.dto';

export class SocialAuthURL {
  @ApiProperty({ format: 'url' })
  url: string;
}

export class SocialAuthCode {
  @ApiProperty()
  code: string;

  @ApiProperty()
  state: string;
}

export class SocialAuthResponse {
  @ApiProperty({
    required: false,
    description: 'Current user if user already exists.',
  })
  user: AuthenticatedUserResponse;

  @ApiProperty({
    required: false,
    description: 'Use this token to create new user.',
  })
  signupToken: string;
}

class SocialUser {
  @ApiProperty()
  nickname: string;

  @ApiProperty({ format: 'url' })
  avatar: string;

  @ApiProperty()
  data: { [key: string]: any };

  @ApiProperty()
  createTime: Date;
}

export class SocialConnectionResponse {
  @ApiProperty({ enum: SocialAuthType })
  type: SocialAuthType;

  @ApiProperty()
  name: string;

  @ApiProperty({ format: 'url' })
  logo: string;

  @ApiProperty({ format: 'url' })
  authURL: string;

  @ApiProperty()
  connected: boolean;

  @ApiProperty({ required: false })
  socialUser: SocialUser;
}
