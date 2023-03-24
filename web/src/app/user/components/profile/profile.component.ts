import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserResponseDto } from '../../dto/user.dto';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user?: UserResponseDto;


  constructor(private readonly userService: UserService) { }

  ngOnInit(): void {
    this.userService.user$.subscribe(user => {
      this.user = user;
    });
  }
}
