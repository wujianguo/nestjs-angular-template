import { Inject, Injectable } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from './email.module-definition';
import { EmailModuleOptions } from './email-module-options.interface';
import { ConsoleEmailAdapter } from './adapter/console-email.adapter';
import { IEmailAdapter } from './adapter/email-adapter.interface';

@Injectable()
export class EmailService {
  private readonly adapter: IEmailAdapter;

  constructor(@Inject(MODULE_OPTIONS_TOKEN) private options: EmailModuleOptions) {
    this.adapter = this.options.adapter || new ConsoleEmailAdapter();
  }

  async send(subject: string, message: string, recipientList: string[]): Promise<void> {
    return this.adapter.send(subject, message, recipientList);
  }
}
