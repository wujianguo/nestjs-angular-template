import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NbAuthResult, NbAuthStrategyClass, NbPasswordAuthStrategy, NbPasswordAuthStrategyOptions, NbPasswordStrategyModule } from "@nebular/auth"
import { catchError, map, Observable } from "rxjs";

export class SocialAuthStrategyOptions extends NbPasswordAuthStrategyOptions {
  getAuthURL?: boolean | NbPasswordStrategyModule = {
    alwaysFail: false,
    endpoint: 'authURL',
    method: 'get',
    requireValidToken: false,
    redirect: {
      success: null,
      failure: null,
    },
    defaultErrors: ['provider is not correct, please try again.'],
    defaultMessages: ['You have been successfully get auth url.'],
  };
  authorize?: boolean | NbPasswordStrategyModule = {
    alwaysFail: false,
    endpoint: 'authorize',
    method: 'post',
    requireValidToken: true,
    redirect: {
      success: null,
      failure: null,
    },
    defaultErrors: ['Code is not correct, please try again.'],
    defaultMessages: ['You have been successfully verified.'],
  };
}

export const socialStrategyOptions: SocialAuthStrategyOptions = new SocialAuthStrategyOptions();


@Injectable()
export class SocialAuthStrategy extends NbPasswordAuthStrategy {


  protected override defaultOptions: SocialAuthStrategyOptions = socialStrategyOptions;

  static override setup(options: SocialAuthStrategyOptions): [NbAuthStrategyClass, SocialAuthStrategyOptions] {
    return [SocialAuthStrategy, options];
  }

  constructor(http: HttpClient, route: ActivatedRoute) {
    super(http, route);
  }

  request(module: string, data: any): Observable<NbAuthResult> {
    const method = this.getOption(`${module}.method`);
    const url = this.getActionEndpoint(module);
    const requireValidToken = this.getOption(`${module}.requireValidToken`);
    return this.http.request(method, url, { body: data, observe: 'response', headers: this.getHeaders() }).pipe(
      map((res) => {
        if (this.getOption(`${module}.alwaysFail`)) {
          throw this.createFailResponse(data);
        }

        return res;
      }),
      map((res) => {
        let redirect = undefined;
        if (this.getOption(`${module}.redirect.success`)) {
          redirect = this.getOption(`${module}.redirect.success`).replace('${token}', this.getOption('token.getter')(module, res, this.options));
        }
        return new NbAuthResult(
          true,
          res,
          redirect,
          [],
          this.getOption('messages.getter')(module, res, this.options),
          this.createToken(this.getOption('token.getter')(module, res, this.options), requireValidToken),
        );
      }),
      catchError((res) => {
        return this.handleResponseError(res, module);
      }),
    );
  }

  getAuthURL(provider: string, type: 'signup' | 'connect'): Observable<NbAuthResult> {
    const module = 'getAuthURL';
    const url = this.getActionEndpoint(module).replace('{provider}', provider) + `?type=${type}`;
    return this.http.get(url, {observe: 'response', headers: this.getHeaders() }).pipe(
      map((res) => {
        return new NbAuthResult(
          true,
          res,
          (res.body as any).url,
          [],
          this.getOption('messages.getter')(module, res, this.options),
          undefined,
        );
      }),
      catchError( res => {
        return this.handleResponseError(res, module);
      }),
    );
  }

  authorize(code: string, state?: string): Observable<NbAuthResult> {
    return this.request('authorize', { code, state });
  }
}
