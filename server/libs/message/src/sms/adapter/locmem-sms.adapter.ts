import { ISmsAdapter, SmsMessage } from './sms-adapter.interface';

export class LocmemSmsAdapter implements ISmsAdapter {
  messages: SmsMessage[] = [];

  async send(message: string, recipientList: string[]): Promise<void> {
    const msg = new SmsMessage(message, recipientList);
    this.messages.unshift(msg);
  }
}
