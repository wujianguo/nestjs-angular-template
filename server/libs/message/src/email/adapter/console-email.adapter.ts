import { Logger } from '@nestjs/common';
import { IEmailAdapter } from './email-adapter.interface';

export class ConsoleEmailAdapter implements IEmailAdapter {
  private readonly logger = new Logger(ConsoleEmailAdapter.name);

  async send(
    subject: string,
    recipientList: string[],
    context: { [key: string]: any },
    template?: string,
    text?: string,
    html?: string,
  ): Promise<void> {
    this.logger.log(subject);
    this.logger.log(template);
    this.logger.log(text);
    this.logger.log(html);
    this.logger.log(context);
    this.logger.log(recipientList);
  }
}
