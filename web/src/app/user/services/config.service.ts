import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { buildAPI } from '../../core/utils/api';
import { AuthConfig } from '../dto/auth-config.dto';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  config$: BehaviorSubject<AuthConfig> = new BehaviorSubject<AuthConfig>({ email: { enable: true, domain: '' }, sms: { enable: false, prefix: '' }, socials: [] });

  constructor(private http: HttpClient) {
    this.getConfig().subscribe(config => {
      this.config$.next(config);
    });
  }

  private getConfig(): Observable<AuthConfig> {
    const url = buildAPI('/auth/config');
    return this.http.get(url)
      .pipe(map(res => {
        return res as AuthConfig;
      }),);
  }
}
