import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async send(subject: string, message: string, recipientList: string[]): Promise<void> {
    this.logger.log(subject);
    // todo: delete this
    this.logger.debug(message);
    this.logger.log(recipientList);
    // await firstValueFrom(this.httpService.get('http://localhost:3000').pipe());
    return;
  }
}
