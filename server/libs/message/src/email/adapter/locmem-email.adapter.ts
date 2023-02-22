import { EmailMessage, IEmailAdapter } from './email-adapter.interface';

export class LocmemEmailAdapter implements IEmailAdapter {
  messages: EmailMessage[] = [];

  async send(
    subject: string,
    recipientList: string[],
    context: { [key: string]: any },
    template?: string,
    text?: string,
    html?: string,
  ): Promise<void> {
    const msg = new EmailMessage(subject, recipientList, context, template, text, html);
    this.messages.unshift(msg);
  }
}
