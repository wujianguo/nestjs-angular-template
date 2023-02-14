import { ConfigurableModuleBuilder } from '@nestjs/common';
import { UserModuleOptions } from './user-module-options.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<UserModuleOptions>().setClassMethodName('forRoot').build();
