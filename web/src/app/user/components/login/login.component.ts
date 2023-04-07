import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthConfig } from '../../dto/auth-config.dto';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  config$?: Observable<AuthConfig>;
  config!: AuthConfig;

  loginForm = new FormGroup({
    login: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  // rememberMe = false;
  loginProcessing = false;

  constructor(private readonly configService: ConfigService, private readonly router: Router, private readonly authService: AuthService) {
    this.config$ = this.configService.config$;
    this.config$.subscribe(config => {
      this.config = config;
    });
    this.authService.isAuthenticated().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigateByUrl('/');
      }
    });
  }

  login(): void {
    this.loginProcessing = true;
    this.loginForm.disable();
    let login = this.loginForm.value.login || '';
    if (/^\d+$/.test(login)) {
      login = this.config.sms.prefix + login;
    }
    const password = this.loginForm.value.password || '';
    this.authService.authenticate('auth', { login, password }).subscribe(res => {
      this.loginProcessing = false;
      this.loginForm.enable();
      if (res.isSuccess()) {
        const redirect = res.getRedirect();
        this.router.navigateByUrl(redirect);                  
      }
    });
  }

  socialLogin(provider: string): void {
    this.authService.getAuthURL('social', provider, 'signup').subscribe(res => {
      if (res.isSuccess()) {
        const redirect = res.getRedirect();
        window.location.href = redirect;
      }
    });
  }
}
