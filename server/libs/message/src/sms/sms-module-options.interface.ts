import { ISmsAdapter } from './adapter/sms-adapter.interface';

export interface SmsModuleOptions {
  adapter?: ISmsAdapter;
}
