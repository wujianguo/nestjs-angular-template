export class SmsMessage {
  public time: Date = new Date();
  constructor(public template: string, public context: { [key: string]: any }, public recipientList: string[]) {}
}

export interface ISmsAdapter {
  send(template: string, context: { [key: string]: any }, recipientList: string[]): Promise<void>;
}
