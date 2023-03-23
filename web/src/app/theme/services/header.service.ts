import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserResponseDto } from '../../user/dto/user.dto';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  user$: BehaviorSubject<UserResponseDto | undefined> = new BehaviorSubject<UserResponseDto | undefined>(undefined);

}
