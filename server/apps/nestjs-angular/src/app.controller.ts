import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): { [key: string]: any } {
    return { data: 'Hello World!' };
  }
}
