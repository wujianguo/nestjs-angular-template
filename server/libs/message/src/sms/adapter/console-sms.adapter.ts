import { Logger } from '@nestjs/common';
import { ISmsAdapter } from './sms-adapter.interface';

export class ConsoleSmsAdapter implements ISmsAdapter {
  private readonly logger = new Logger(ConsoleSmsAdapter.name);

  async send(message: string, recipientList: string[]): Promise<void> {
    this.logger.log(message);
    this.logger.log(recipientList);
  }
}
