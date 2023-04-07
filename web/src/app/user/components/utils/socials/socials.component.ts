import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { SocialAuthConfig } from '../../../dto/auth-config.dto';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-socials',
  templateUrl: './socials.component.html',
  styleUrls: ['./socials.component.scss']
})
export class SocialsComponent implements OnInit {

  @Input() socials: SocialAuthConfig[] = [];

  constructor(private readonly sanitizer: DomSanitizer, private readonly authService: AuthService) { }

  ngOnInit(): void {
  }

  bypassSecurityTrustHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
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
