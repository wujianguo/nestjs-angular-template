import { Controller, Get } from '@nestjs/common';
import { FrontendService } from './frontend.service';

@Controller()
export class FrontendController {
  constructor(private readonly frontendService: FrontendService) {}

  @Get()
  getHello(): { [key: string]: any } {
    return { data: this.frontendService.getHello() };
  }
}
