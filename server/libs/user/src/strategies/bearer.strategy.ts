import { Strategy } from 'passport-http-bearer';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthContext } from '../decorators/auth-user.decorator';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy, 'bearer') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(token: string): Promise<AuthContext> {
    const record = await this.authService.validateToken(token);
    if (!record) {
      throw new UnauthorizedException();
    }
    return new AuthContext(record.user, record);
  }
}

@Injectable()
export class BearerAuthGuard extends AuthGuard('bearer') {}
