import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { buildAPI } from '../../core/utils/api';
import { UserResponseDto } from '../dto/user.dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  profile(): Observable<UserResponseDto> {
    return this.http.get(buildAPI('/user/profile')).pipe(map(res => {
      return res as UserResponseDto;
    }));
  }
}
