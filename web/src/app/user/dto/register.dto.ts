import { UserProfileDto } from "./user.dto";

export interface RegisterTokenResponse {
  token: string;
}

export interface RegisterCompleteRequest extends UserProfileDto {
  password: string;
  token: string;
}
