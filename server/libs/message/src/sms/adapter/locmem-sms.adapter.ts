import { ISmsAdapter, SmsMessage } from './sms-adapter.interface';

export class LocmemSmsAdapter implements ISmsAdapter {
  messages: SmsMessage[] = [];

  async send(template: string, context: { [key: string]: any }, recipientList: string[]): Promise<void> {
    const msg = new SmsMessage(template, context, recipientList);
    this.messages.unshift(msg);
  }
}
