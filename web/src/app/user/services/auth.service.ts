import { Injectable } from '@angular/core';
import { NbAuthResult, NbAuthService } from '@nebular/auth';
import { Observable } from 'rxjs';
import { EmailAuthStrategy } from '../strategies/email.strategy';
import { SmsAuthStrategy } from '../strategies/phone-number.strategy';
import { SocialAuthStrategy } from '../strategies/social.strategy';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends NbAuthService {
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
}
