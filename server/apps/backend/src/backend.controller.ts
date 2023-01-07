import { Controller, Get } from '@nestjs/common';
import { BackendService } from './backend.service';

@Controller()
export class BackendController {
  constructor(private readonly backendService: BackendService) {}

  @Get()
  getHello(): { [key: string]: any } {
    return { data: this.backendService.getHello() };
  }
}
