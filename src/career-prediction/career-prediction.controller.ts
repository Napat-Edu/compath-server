import { Body, Controller, Post } from '@nestjs/common';
import { CareerPredictionService } from './career-prediction.service';
import { IUserResumeInput } from 'src/interfaces/career-prediction.interface';

@Controller('/career-prediction')
export class CareerPredictionController {
  constructor(
    private readonly careerPredictionService: CareerPredictionService,
  ) {}

  @Post()
  createCareerPrediction(@Body() userResumeInput: IUserResumeInput) {
    try {
      return this.careerPredictionService.createCareerPrediction(
        userResumeInput,
      );
    } catch (err) {
      return err;
    }
  }
}
