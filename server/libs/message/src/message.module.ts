import { Module } from '@nestjs/common';
import { EmailService } from './services/emai.service';

@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class MessageModule {}
