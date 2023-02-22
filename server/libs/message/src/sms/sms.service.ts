import { Inject, Injectable } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from './sms.module-definition';
import { SmsModuleOptions } from './sms-module-options.interface';
import { ISmsAdapter } from './adapter/sms-adapter.interface';
import { ConsoleSmsAdapter } from './adapter/console-sms.adapter';

@Injectable()
export class SmsService {
  private readonly adapter: ISmsAdapter;

  constructor(@Inject(MODULE_OPTIONS_TOKEN) private options: SmsModuleOptions) {
    this.adapter = this.options.adapter || new ConsoleSmsAdapter();
  }

  async send(template: string, context: { [key: string]: any }, recipientList: string[]): Promise<void> {
    return this.adapter.send(template, context, recipientList);
  }
}
