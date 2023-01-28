import { Logger } from '@nestjs/common';
import { IEmailAdapter } from './email-adapter.interface';

export class ConsoleEmailAdapter implements IEmailAdapter {
  private readonly logger = new Logger(ConsoleEmailAdapter.name);

  async send(subject: string, message: string, recipientList: string[]): Promise<void> {
    this.logger.log(subject);
    this.logger.log(message);
    this.logger.log(recipientList);
  }
}
