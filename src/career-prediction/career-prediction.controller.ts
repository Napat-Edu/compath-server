import { Controller, Get } from '@nestjs/common';
import { CareerPredictionService } from './career-prediction.service';

@Controller("/career-prediction")
export class CareerPredictionController {
  constructor(
    private readonly careerPredictionService: CareerPredictionService,
  ) {}

  @Get()
  getCareerPrediction(): any {
    return this.careerPredictionService.getCareerPredictionResult();
  }
}
