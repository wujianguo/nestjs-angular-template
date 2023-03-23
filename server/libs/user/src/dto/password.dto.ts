import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { VerifyCodeRequest } from './mfa.dto';

export class ChangePasswordRequest {
  @ApiProperty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'password should contains (uppercase letters && lowercase letters && (numbers || punctuation and special characters))',
  })
  @ApiProperty({ required: true })
  newPassword: string;
}

export class ResetPasswordRequest extends VerifyCodeRequest {
  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'password should contains (uppercase letters && lowercase letters && (numbers || punctuation and special characters))',
  })
  @ApiProperty({ required: true })
  newPassword: string;
}

export class PasswordRequest {
  @ApiProperty({ required: true })
  password: string;
}
