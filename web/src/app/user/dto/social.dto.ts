import { AuthenticatedUser } from "./user.dto";

export interface SuggestUserResponse {
  username: string;

  firstName: string;

  lastName: string;
}

export interface SocialAuthResponse {

  user?: AuthenticatedUser;

  signupToken?: string;

  suggestUser?: SuggestUserResponse;
}
