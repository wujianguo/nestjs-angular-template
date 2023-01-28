import { IEmailAdapter } from './adapter/email-adapter.interface';

export interface EmailModuleOptions {
  adapter?: IEmailAdapter;
}
