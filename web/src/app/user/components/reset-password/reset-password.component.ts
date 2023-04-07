import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NbStepperComponent } from '@nebular/theme';
import { Observable } from 'rxjs';
import { AuthConfig } from '../../dto/auth-config.dto';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  config$: Observable<AuthConfig>;
  config!: AuthConfig;

  sendProcessing = false;
  verifyProcessing = false;

  recipient = '';
  codeToken: string = '';

  recipientForm = new FormGroup({
    recipient: new FormControl('', [Validators.required]),
  });

  emailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  phoneNumberForm = new FormGroup({
    phoneNumber: new FormControl('', [Validators.required]),
  });

  codeForm = new FormGroup({
    code: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  @ViewChild(NbStepperComponent) stepper!: NbStepperComponent;

  constructor(private readonly configService: ConfigService,
    private readonly router: Router,
    private readonly authService: AuthService) {
    this.config$ = this.configService.config$;
    this.config$.subscribe(config => {
      this.config = config;
    });
  }

  isEmail(recipient: string): boolean {
    return recipient.indexOf('@') > 0;
  }

  strategy(recipient: string): string {
    return this.isEmail(recipient) ? 'email' : 'sms';
  }

  send(): void {
    const recipient = this.recipientForm.value.recipient || this.emailForm.value.email || this.phoneNumberForm.value.phoneNumber || '';
    if (this.isEmail(recipient)) {
      this.recipient = recipient;
      this.sendProcessing = true;
      this.authService.requestPassword('email', { email: recipient }).subscribe(res => {
        this.sendProcessing = false;
        if (res.isSuccess()) {
          this.codeToken = res.getResponse().body.token;
          this.stepper.next();
        }
      });
    } else {
      this.sendProcessing = true;
      this.config$.subscribe(config => {
        const phoneNumber = `${config.sms.prefix}${recipient}`;
        this.recipient = phoneNumber;
        this.authService.requestPassword('sms', { phoneNumber }).subscribe(res => {
          this.sendProcessing = false;
          if (res.isSuccess()) {
            this.codeToken = res.getResponse().body.token;
            this.stepper.next();
          }
        });
      });
    }
  }

  verify(): void {
    const code = this.codeForm.value.code || '';
    const password = this.codeForm.value.password || '';
    this.verifyProcessing = true;
    this.authService.resetPassword('auth', { code, token: this.codeToken, newPassword: password }).subscribe(res => {
      this.verifyProcessing = false;
      if (res.isSuccess()) {
        const redirect = res.getRedirect();
        this.router.navigateByUrl(redirect);
      }
    });
  }

}
