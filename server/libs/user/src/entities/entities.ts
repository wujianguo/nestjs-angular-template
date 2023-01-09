import { LoginRecord } from './login-record.entity';
import { MultiFactorVerifyCode } from './mfa.entity';
import { SignupToken } from './signup.entity';
import { SocialAccount } from './social-account.entity';
import { User } from './user.entity';

export const userEntities = [User, MultiFactorVerifyCode, LoginRecord, SocialAccount, SignupToken];
