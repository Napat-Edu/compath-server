import { Controller, Get, Query } from '@nestjs/common';
import { CareerInsightService } from './career-insight.service';
import { ICareerInsightRequest } from 'src/interfaces/career-insight.interface';

@Controller('/career-insight')
export class CareerInsightController {
  constructor(private readonly careerInsightService: CareerInsightService) {}

  @Get()
  getCareerInsight(@Query() query: ICareerInsightRequest) {
    return this.careerInsightService.getCareerInsight(
      query.career_path,
      query.object_id,
    );
  }
}
