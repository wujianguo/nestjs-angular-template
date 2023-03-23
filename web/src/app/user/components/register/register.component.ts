import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NbStepperComponent } from '@nebular/theme';
import { Observable } from 'rxjs';
import { AuthConfig } from '../../dto/auth-config.dto';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  config$: Observable<AuthConfig>;
  config!: AuthConfig;

  sendProcessing = false;
  verifyProcessing = false;
  registerProcessing = false;

  recipient = '';
  codeToken: string = '';
  // countDown = 0;
  signupToken: string = '';

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
  });

  completeForm = new FormGroup({
    username: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    password: new FormControl(''),
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
      this.authService.sendRegisterEmail('email', { email: recipient }).subscribe(res => {
        this.sendProcessing = false;
        if (res.isSuccess()) {
          this.codeToken = res.getToken().getValue();
          this.stepper.next();
        }
      });
    } else {
      this.sendProcessing = true;
      this.config$.subscribe(config => {
        const phoneNumber = `${config.sms.prefix}${recipient}`;
        this.recipient = phoneNumber;
        this.authService.sendRegisterSms('sms', { phoneNumber }).subscribe(res => {
          this.sendProcessing = false;
          if (res.isSuccess()) {
            this.codeToken = res.getToken().getValue();
            this.stepper.next();
          }
        });
      });
    }
  }

  verify(): void {
    const code = this.codeForm.value.code || '';
    if (this.isEmail(this.recipient)) {
      this.verifyProcessing = true;
      this.authService.verifyRegisterEmail('email', { code, token: this.codeToken }).subscribe(res => {
        this.verifyProcessing = false;
        if (res.isSuccess()) {
          this.signupToken = res.getToken().getValue();
          this.stepper.next();
          this.completeForm.patchValue({ username: this.recipient.indexOf('@') > 0 ? this.recipient.split('@')[0] : '' });
        }
      });
    } else {
      this.verifyProcessing = true;
      this.authService.verifyRegisterSms('sms', { code, token: this.codeToken }).subscribe(res => {
        this.verifyProcessing = false;
        if (res.isSuccess()) {
          this.signupToken = res.getToken().getValue();
          this.stepper.next();
        }
      });
    }
  }

  completeRegister(): void {
    const username = this.completeForm.value.username || '';
    const firstName = this.completeForm.value.firstName || undefined;
    const lastName = this.completeForm.value.lastName || undefined;
    const password = this.completeForm.value.password || '';
    const token = this.signupToken;
    const data = { username, firstName, lastName, password, token };
    this.registerProcessing = true;
    this.authService.register('auth', data).subscribe(res => {
      this.registerProcessing = false;
      if (res.isSuccess()) {
        const redirect = res.getRedirect();
        this.router.navigateByUrl(redirect);
      }
    });
  }
}
