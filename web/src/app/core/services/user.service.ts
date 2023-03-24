import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { buildAPI } from '../../core/utils/api';
import { UserResponseDto } from '../../user/dto/user.dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user$: BehaviorSubject<UserResponseDto|undefined> = new BehaviorSubject<UserResponseDto|undefined>(undefined);

  constructor(private readonly http: HttpClient, private readonly authService: NbAuthService) {
    this.authService.onAuthenticationChange().subscribe(auth => {
      if (auth) {
        this.profile().subscribe(user => {
          this.user$.next(user);
        });
      } else {
        this.user$.next(undefined);
      }
    });
  }

  private profile(): Observable<UserResponseDto> {
    return this.http.get(buildAPI('/user/profile')).pipe(map(res => {
      return res as UserResponseDto;
    }));
  }
}
