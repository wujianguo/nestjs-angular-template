import { ApiProperty } from '@nestjs/swagger';
import { VerifyCodeRequest } from './mfa.dto';

export class ChangePasswordRequest {
  @ApiProperty()
  oldPassword: string;

  @ApiProperty()
  newPassword: string;
}

export class ResetPasswordRequest extends VerifyCodeRequest {
  @ApiProperty()
  newPassword: string;
}
