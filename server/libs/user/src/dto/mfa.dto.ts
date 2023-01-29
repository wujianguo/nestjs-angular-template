import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';

export class SendEmailCodeRequest {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ format: 'email' })
  email: string;
}

export class SendSmsCodeRequest {
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  @ApiProperty()
  phoneNumber: string;
}

export class SendCodeResponse {
  @ApiProperty()
  token: string;

  constructor(token: string) {
    this.token = token;
  }
}

export class VerifyCodeRequest {
  @IsString()
  @IsNotEmpty()
  @Length(32, 32)
  @ApiProperty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @ApiProperty()
  code: string;
}
