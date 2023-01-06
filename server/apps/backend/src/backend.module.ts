import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { BackendController } from './backend.controller';
import { BackendService } from './backend.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'web'),
      renderPath: new RegExp('^(?!/api).*'),
      exclude: ['/api*'],
    }),
  ],
  controllers: [BackendController],
  providers: [BackendService],
})
export class BackendModule {}
