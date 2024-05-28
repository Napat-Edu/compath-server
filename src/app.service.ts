import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor() { }

  getHello(): string {
    return `This is ${process.env.MODE} mode`;
  }
}
