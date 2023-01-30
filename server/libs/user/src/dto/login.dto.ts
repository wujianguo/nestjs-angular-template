import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginRequest {
  @IsString()
  @IsNotEmpty()
  @Length(1, 320)
  @ApiProperty({ description: 'username/email/phone' })
  login: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
