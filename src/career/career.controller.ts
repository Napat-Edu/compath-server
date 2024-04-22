import { Controller, Delete, Get, Query } from '@nestjs/common';
import { CareerService } from './career.service';

@Controller('/career')
export class CareerController {
  constructor(private readonly careerService: CareerService) {}

  @Get('history')
  getPredictionHistory(@Query() query: { email: string }) {
    return this.careerService.getPredictionHistory(query.email);
  }

  @Delete('history')
  deletePredictionHistory(@Query() query: { id: string }) {
    return this.careerService.deletePredictionHistory(query.id);
  }
}
