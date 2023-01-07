import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  data$?: Observable<string>;

  constructor(private service: UserService) { }

  ngOnInit(): void {
    this.data$ = this.service.getHello();
  }
}
