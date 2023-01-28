import { ConfigurableModuleBuilder } from '@nestjs/common';
import { SmsModuleOptions } from './sms-module-options.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<SmsModuleOptions>().setClassMethodName('forRoot').build();
