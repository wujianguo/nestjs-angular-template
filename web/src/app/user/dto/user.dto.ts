export interface UserProfileDto {
  username: string;

  firstName?: string;

  lastName?: string;
}

export interface UserResponseDto extends UserProfileDto {
  avatar?: string;

  email?: string;

  phoneNumber?: string;
}

export interface AuthenticatedUser extends UserProfileDto {
  token: string;
}
