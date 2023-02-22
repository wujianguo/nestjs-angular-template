import { IEmailAdapter } from '@app/message';
import { MailerService } from '@nestjs-modules/mailer';

export class NodeMailerEmailAdapter implements IEmailAdapter {
  constructor(private readonly mailerService: MailerService, private readonly from: string) {}

  async send(
    subject: string,
    recipientList: string[],
    context: { [key: string]: any },
    template?: string,
    text?: string,
    html?: string,
  ): Promise<void> {
    let renderText = text;
    if (text) {
      for (const key in context) {
        renderText = text.replace(`\${${key}}`, context[key]);
      }
    }
    let renderHtml = html;
    if (html) {
      for (const key in context) {
        renderHtml = html.replace(`\${${key}}`, context[key]);
      }
    }
    await this.mailerService.sendMail({
      to: recipientList,
      from: this.from,
      subject: subject,
      text: renderText,
      html: renderHtml,
      template: template,
      context: context,
    });
  }
}
