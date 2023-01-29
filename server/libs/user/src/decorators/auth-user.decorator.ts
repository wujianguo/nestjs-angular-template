import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { LoginRecord } from '../entities/login-record.entity';
import { User } from '../entities/user.entity';

export class AuthContext {
  constructor(public readonly user: User, public readonly token: LoginRecord) {}
}

export const GetAuthContext = createParamDecorator((data: unknown, ctx: ExecutionContext): AuthContext => {
  return ctx.switchToHttp().getRequest<{ user: AuthContext }>().user;
});
