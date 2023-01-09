import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { User } from '../entities/user.entity';

export class UserProfileDto {
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
  phone?: string;
}

export class AuthenticatedUserResponse extends UserResponse {
  @ApiProperty()
  token: string;
}

export function mapUser(entity: User): UserResponse {
  return {
    username: entity.username,
  };
}

export function mapAuthUser(token: string, entity: User): AuthenticatedUserResponse {
  return {
    token: token,
    username: entity.username,
  };
}
