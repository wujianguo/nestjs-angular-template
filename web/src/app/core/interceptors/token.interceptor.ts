import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { NbAuthService } from '@nebular/auth';
import { catchError, switchMap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(public auth: NbAuthService, private router: Router, private toastrService: NbToastrService) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.auth.getToken().pipe(switchMap(token => {
      if (token.getValue() !== null && token.getValue() !== undefined && token.getValue() !== '') {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token.getValue()}`,
          },
        });
      }
      return next.handle(request).pipe(
        catchError(err => {
          if (err instanceof HttpErrorResponse && err.status === 401) {
            this.router.navigateByUrl('/auth/login');
          }
          console.log(err);
          this.toastrService.danger(`${err.error.message || err.statusText}`, `${err.error.error || err.status}`);
          return throwError(() => err);
        }));
    }));
  }
}
