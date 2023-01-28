import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigurableModuleClass, ASYNC_OPTIONS_TYPE, OPTIONS_TYPE } from './sms.module-definition';
import { SmsService } from './sms.service';

@Global()
@Module({
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule extends ConfigurableModuleClass {
  static forRoot(options: typeof OPTIONS_TYPE = {}): DynamicModule {
    return {
      ...super.forRoot(options),
    };
  }

  static forRootAsync(options: typeof ASYNC_OPTIONS_TYPE = {}): DynamicModule {
    return {
      ...super.forRootAsync(options),
    };
  }
}
