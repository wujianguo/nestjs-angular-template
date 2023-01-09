import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { UserProfileDto } from './user.dto';

export class SignupTokenResponse {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The signup token, use this to complete your signup',
  })
  token: string;
}

export class SignupProfileDto extends UserProfileDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}

export class SignupCompleteRequest extends SignupProfileDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  token: string;
}
