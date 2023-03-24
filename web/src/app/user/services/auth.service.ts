import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { NbAuthResult, NbAuthService, NbTokenService, NB_AUTH_STRATEGIES } from '@nebular/auth';
import { Observable } from 'rxjs';
import { buildAPI } from '../../core/utils/api';
import { EmailAuthStrategy } from '../strategies/email.strategy';
import { SmsAuthStrategy } from '../strategies/phone-number.strategy';
import { SocialAuthStrategy } from '../strategies/social.strategy';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends NbAuthService {

  constructor(private readonly http: HttpClient, tokenService: NbTokenService, @Inject(NB_AUTH_STRATEGIES) strategies: any[]) {
    super(tokenService, strategies);
  }

  sendRegisterEmail(strategyName: string, data: any): Observable<NbAuthResult> {
    return (this.getStrategy(strategyName) as EmailAuthStrategy).sendRegisterEmail(data);
  }

  verifyRegisterEmail(strategyName: string, data: any): Observable<NbAuthResult> {
    return (this.getStrategy(strategyName) as EmailAuthStrategy).verifyRegisterEmail(data);
  }

  sendRegisterSms(strategyName: string, data: any): Observable<NbAuthResult> {
    return (this.getStrategy(strategyName) as SmsAuthStrategy).sendRegisterSms(data);
  }

  verifyRegisterSms(strategyName: string, data: any): Observable<NbAuthResult> {
    return (this.getStrategy(strategyName) as SmsAuthStrategy).verifyRegisterSms(data);
  }

  getAuthURL(strategyName: string, provider: string, type: 'signup' | 'connect'): Observable<NbAuthResult> {
    return (this.getStrategy(strategyName) as SocialAuthStrategy).getAuthURL(provider, type);
  }

  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(buildAPI('/auth/password/change'), { oldPassword, newPassword });
  }
}
