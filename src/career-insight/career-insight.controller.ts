import { Controller, Get } from '@nestjs/common';
import { CareerInsightService } from './career-insight.service';

@Controller('/career-insight')
export class CareerInsightController {
  constructor(private readonly careerInsightService: CareerInsightService) {}

  @Get()
  getCareerInsightInfo() {
    try {
      return this.careerInsightService.getCareerInsightInfo();
    } catch (err) {
      return err;
    }
  }
}
