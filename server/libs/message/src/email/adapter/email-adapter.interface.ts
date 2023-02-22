export class EmailMessage {
  public time: Date = new Date();
  constructor(
    public subject: string,
    public recipientList: string[],
    public context: { [key: string]: any },
    public template?: string,
    public text?: string,
    public html?: string,
  ) {}
}

export interface IEmailAdapter {
  send(
    subject: string,
    recipientList: string[],
    context: { [key: string]: any },
    template?: string,
    text?: string,
    html?: string,
  ): Promise<void>;
}
