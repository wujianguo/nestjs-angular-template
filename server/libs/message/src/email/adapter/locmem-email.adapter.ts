import { EmailMessage, IEmailAdapter } from './email-adapter.interface';

export class LocmemEmailAdapter implements IEmailAdapter {
  messages: EmailMessage[] = [];

  async send(subject: string, message: string, recipientList: string[]): Promise<void> {
    const msg = new EmailMessage(subject, message, recipientList);
    this.messages.unshift(msg);
  }
}
