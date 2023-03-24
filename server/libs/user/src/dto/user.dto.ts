import { ApiProperty, PartialType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { IsAlphanumeric, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class UserProfileDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 20)
  @Matches(/^(?=.*[a-zA-Z]).+$/, { message: 'username must contain at least one alphabetical character' })
  @IsAlphanumeric('en-US', { message: 'username contains only letters and numbers' })
  @ApiProperty()
  username: string;

  @ApiProperty({ required: false })
  firstName?: string;

  @ApiProperty({ required: false })
  lastName?: string;
}

export class UpdateUserRequest extends PartialType(UserProfileDto) {}

export class UserResponse extends UserProfileDto {
  @ApiProperty({ format: 'url', required: false })
  avatar?: string;

  @ApiProperty({ description: 'Desensitized email', format: 'email', required: false })
  email?: string;

  @ApiProperty({ description: 'Desensitized phone number', required: false })
  phoneNumber?: string;
}

export class AuthenticatedUserResponse extends UserResponse {
  @ApiProperty()
  token: string;
}

export function mapUser(entity: User): UserResponse {
  return {
    username: entity.username,
    firstName: entity.firstName,
    lastName: entity.lastName,
    avatar: entity.avatar,
    email: entity.desensitizedEmail,
    phoneNumber: entity.desensitizedPhoneNumber,
  };
}

export function mapAuthUser(token: string, entity: User): AuthenticatedUserResponse {
  return {
    token: token,
    username: entity.username,
    firstName: entity.firstName,
    lastName: entity.lastName,
    avatar: entity.avatar,
    email: entity.desensitizedEmail,
    phoneNumber: entity.desensitizedPhoneNumber,
  };
}
