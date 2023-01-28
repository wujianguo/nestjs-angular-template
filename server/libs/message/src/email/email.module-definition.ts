import { ConfigurableModuleBuilder } from '@nestjs/common';
import { EmailModuleOptions } from './email-module-options.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<EmailModuleOptions>().setClassMethodName('forRoot').build();
