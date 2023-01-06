import { NestFactory } from '@nestjs/core';
import { BackendModule } from './backend.module';

async function bootstrap() {
  const app = await NestFactory.create(BackendModule);
  app.setGlobalPrefix('api');
  await app.listen(3000);
}
bootstrap();
