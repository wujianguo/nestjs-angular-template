import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbAuthModule, NbPasswordAuthStrategy } from '@nebular/auth';

import { NbAlertModule, NbButtonGroupModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbSelectModule, NbStepperModule, NbTabsetModule, NbUserModule } from '@nebular/theme';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserRoutingModule, routedComponents } from './user-routing.module';
import { environment } from '../../environments/environment';
import { EmailAuthStrategy } from './strategies/email.strategy';
import { SmsAuthStrategy } from './strategies/phone-number.strategy';
import { SocialAuthStrategy } from './strategies/social.strategy';
import { SocialsComponent } from './components/utils/socials/socials.component';

@NgModule({
  declarations: [
    ...routedComponents,
    SocialsComponent,
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NbAuthModule.forRoot({
      strategies: [
        EmailAuthStrategy.setup({
          name: 'email',
          baseEndpoint: environment.api,
          token: {
            getter: (module: string, res: any, options: any) => {
              return res.body.token;
            }
          },
          sendRegisterEmail: { endpoint: '/auth/signup/email/send' },
          verifyRegisterEmail: { endpoint: '/auth/signup/verify' },
          requestPass: { endpoint: '/auth/password/reset/email/send' },
        }),
        SmsAuthStrategy.setup({
          name: 'sms',
          baseEndpoint: environment.api,
          token: {
            getter: (module: string, res: any, options: any) => {
              return res.body.token;
            }
          },
          sendRegisterSms: { endpoint: '/auth/signup/sms/send' },
          verifyRegisterSms: { endpoint: '/auth/signup/verify' },
          requestPass: { endpoint: '/auth/password/reset/sms/send' },
        }),
        SocialAuthStrategy.setup({
          name: 'social',
          baseEndpoint: environment.api,
          getAuthURL: { endpoint: '/auth/social/{provider}/url' },
          authorize: { endpoint: '/auth/social/{provider}/authorize' },
        }),
        NbPasswordAuthStrategy.setup({
          name: 'auth',
          baseEndpoint: environment.api,
          token: {
            getter: (module: string, res: any, options: any) => {
              return res.body.token;
            }
          },
          login: { endpoint: '/auth/login',  redirect: { success: '/user/profile' } },
          logout: { endpoint: '/auth/logout',  redirect: { success: '/auth/login' } },
          register: { endpoint: '/auth/signup/complete', redirect: { success: '/user/profile' } },
          resetPass: { endpoint: '/auth/password/reset/complete', method: 'POST', redirect: { success: '/auth/login' } },
        })
      ],
      // forms: { login: { strategy: 'email' } }
    }),
    NbCardModule,
    NbLayoutModule,
    NbAlertModule,
    NbInputModule,
    NbFormFieldModule,
    NbButtonModule,
    NbButtonGroupModule,
    NbCheckboxModule,
    NbStepperModule,
    // NbTabsetModule,
    // NbSelectModule,
    NbIconModule,
  ],
  providers: [EmailAuthStrategy, SmsAuthStrategy, SocialAuthStrategy],
})
export class UserModule { }
