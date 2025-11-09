import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRootMessage(): string {
    return 'Hello, Sathish! Your backend is running 🚀';
  }
}