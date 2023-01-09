import { ApiProperty } from '@nestjs/swagger';

// export class VerifyEmailRequest {
//   @ApiProperty()
//   code: string;
// }

export class SendEmailCodeRequest {
  @ApiProperty({ format: 'email' })
  email: string;
}

export class SendPhoneCodeRequest {
  @ApiProperty()
  phone: string;
}

export class SendCodeResponse {
  @ApiProperty()
  token: string;
}

export class VerifyCodeRequest {
  @ApiProperty()
  token: string;

  @ApiProperty()
  code: string;
}
