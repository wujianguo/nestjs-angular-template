import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getHello(): Observable<string> {
    const url = '/api';
    return this.http.get(url)
      .pipe(map(res => {
        return (res as {[key: string]: any })['data'].toString();
      }),
    );
  }
}
