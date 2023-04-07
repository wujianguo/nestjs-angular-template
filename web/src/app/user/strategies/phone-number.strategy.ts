import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NbAuthResult, NbAuthStrategyClass, NbPasswordAuthStrategy, NbPasswordAuthStrategyOptions, NbPasswordStrategyModule } from "@nebular/auth"
import { catchError, map, Observable } from "rxjs";

export class SmsAuthStrategyOptions extends NbPasswordAuthStrategyOptions {
  sendRegisterSms?: boolean | NbPasswordStrategyModule = {
    alwaysFail: false,
    endpoint: 'sendRegisterSms',
    method: 'post',
    requireValidToken: true,
    redirect: {
      success: null,
      failure: null,
    },
    defaultErrors: ['Phone number is not correct, please try again.'],
    defaultMessages: ['You have been successfully sent sms.'],
  };
  verifyRegisterSms?: boolean | NbPasswordStrategyModule = {
    alwaysFail: false,
    endpoint: 'verifyRegisterSms',
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

export const smsStrategyOptions: SmsAuthStrategyOptions = new SmsAuthStrategyOptions();


@Injectable()
export class SmsAuthStrategy extends NbPasswordAuthStrategy {


  protected override defaultOptions: SmsAuthStrategyOptions = smsStrategyOptions;

  static override setup(options: SmsAuthStrategyOptions): [NbAuthStrategyClass, SmsAuthStrategyOptions] {
    return [SmsAuthStrategy, options];
  }

  constructor(http: HttpClient, route: ActivatedRoute) {
    super(http, route);
  }

  request(module: string, data: any): Observable<NbAuthResult> {
    const method = this.getOption(`${module}.method`);
    const url = this.getActionEndpoint(module);
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
          redirect = this.getOption(`${module}.redirect.success`);
        }
        return new NbAuthResult(
          true,
          res,
          redirect,
          [],
          this.getOption('messages.getter')(module, res, this.options),
          undefined,
        );
      }),
      catchError((res) => {
        return this.handleResponseError(res, module);
      }),
    );
  }

  override requestPassword(data?: any): Observable<NbAuthResult> {
    return this.request('requestPass', data);
  }

  sendRegisterSms(data: any): Observable<NbAuthResult> {
    return this.request('sendRegisterSms', data);
  }

  verifyRegisterSms(data: any): Observable<NbAuthResult> {
    return this.request('verifyRegisterSms', data);
  }
}
