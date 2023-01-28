export class EmailMessage {
  public time: Date = new Date();
  constructor(public subject: string, public message: string, public recipientList: string[]) {}
}

export interface IEmailAdapter {
  send(subject: string, message: string, recipientList: string[]): Promise<void>;
}
