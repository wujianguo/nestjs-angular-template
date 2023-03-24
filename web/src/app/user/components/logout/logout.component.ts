import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbAuthService } from '@nebular/auth';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  constructor(private readonly router: Router, private readonly authService: NbAuthService) { }

  ngOnInit(): void {
    this.authService.logout('auth').subscribe(res => {
      if (res.isSuccess()) {
        const redirect = res.getRedirect();
        this.router.navigateByUrl(redirect);                  
      }
    })
  }

}
