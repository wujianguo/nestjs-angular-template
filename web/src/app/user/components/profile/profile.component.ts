import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserResponseDto } from '../../dto/user.dto';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user$?: Observable<UserResponseDto>;


  constructor(private readonly userService: UserService) { }

  ngOnInit(): void {
    this.user$ = this.userService.profile();
  }

}
