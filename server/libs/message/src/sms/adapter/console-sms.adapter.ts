import { Logger } from '@nestjs/common';
import { ISmsAdapter } from './sms-adapter.interface';

export class ConsoleSmsAdapter implements ISmsAdapter {
  private readonly logger = new Logger(ConsoleSmsAdapter.name);

  async send(template: string, context: { [key: string]: any }, recipientList: string[]): Promise<void> {
    this.logger.log(template);
    this.logger.log(context);
    this.logger.log(recipientList);
  }
}
