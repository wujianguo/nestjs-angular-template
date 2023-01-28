export class SmsMessage {
  public time: Date = new Date();
  constructor(public message: string, public recipientList: string[]) {}
}

export interface ISmsAdapter {
  send(message: string, recipientList: string[]): Promise<void>;
}
