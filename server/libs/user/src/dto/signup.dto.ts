import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { UserProfileDto } from './user.dto';

export class SignupTokenResponse {
  @ApiProperty({
    description: 'The signup token, use this to complete your signup',
  })
  token: string;

  constructor(token: string) {
    this.token = token;
  }
}

export class SignupProfileDto extends UserProfileDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'password should contains (uppercase letters && lowercase letters && (numbers || punctuation and special characters))',
  })
  @ApiProperty()
  password: string;
}

export class SignupCompleteRequest extends SignupProfileDto {
  @IsString()
  @IsNotEmpty()
  @Length(102, 102)
  @ApiProperty()
  token: string;
}
