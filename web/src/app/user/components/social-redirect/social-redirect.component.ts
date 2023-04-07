import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormControl, FormGroup } from '@angular/forms';
import { SuggestUserResponse } from '../../dto/social.dto';

@Component({
  selector: 'app-social-redirect',
  templateUrl: './social-redirect.component.html',
  styleUrls: ['./social-redirect.component.scss']
})
export class SocialRedirectComponent implements OnInit {

  registerProcessing = false;
  signupToken: string = '';

  completeForm = new FormGroup({
    username: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    password: new FormControl(''),
  });

  constructor(private readonly route: ActivatedRoute, private readonly router: Router, private readonly authService: AuthService) { }

  ngOnInit(): void {
    const provider = this.route.snapshot.paramMap.get('provider') || '';
    const code = this.route.snapshot.queryParamMap.get('code') || this.route.snapshot.queryParamMap.get('authCode') || '';
    const state = this.route.snapshot.queryParamMap.get('state') || '';
    this.authService.isAuthenticated().subscribe(isAuthenticated => {
      if (isAuthenticated) {
      } else {
        this.authService.authenticate('social', { provider, code, state }).subscribe(res => {
          if (res.isSuccess()) {
            if (res.getToken()) {
              const redirect = res.getRedirect();
              this.router.navigateByUrl(redirect);      
            } else {
              this.signupToken = res.getResponse().body.signupToken;
              const suggest: SuggestUserResponse = res.getResponse().body.suggestUser;
              this.completeForm.setValue({
                username: suggest.username,
                firstName: suggest.firstName,
                lastName: suggest.lastName,
                password: ''
              });
            }            
          }
        });  
      }
    });
  }

  connect(): void {

  }

  login(): void {

  }

  register(): void {

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
