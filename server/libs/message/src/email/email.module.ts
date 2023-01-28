import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigurableModuleClass, ASYNC_OPTIONS_TYPE, OPTIONS_TYPE } from './email.module-definition';
import { EmailService } from './email.service';

@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule extends ConfigurableModuleClass {
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
