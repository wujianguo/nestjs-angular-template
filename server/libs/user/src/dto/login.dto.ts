import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'username/email/phone' })
  login: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
