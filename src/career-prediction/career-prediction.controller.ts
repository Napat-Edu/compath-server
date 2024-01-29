import { Body, Controller, Post } from '@nestjs/common';
import { CareerPredictionService } from './career-prediction.service';
import { ResumeInputDto } from 'src/dtos/resume-input.dto';

@Controller('/career-prediction')
export class CareerPredictionController {
  constructor(
    private readonly careerPredictionService: CareerPredictionService,
  ) {}

  @Post()
  getCareerPrediction(@Body() userResumeInput: ResumeInputDto) {
    try {
      return this.careerPredictionService.getCareerPredictionResult(
        userResumeInput,
      );
    } catch (err) {
      return err;
    }
  }

  @Post('/create/resume-history')
  createCareerPredictionHistory(@Body() newResumeHistory: ResumeInputDto) {
    try {
      return this.careerPredictionService.createCareerPredictionHistory(
        newResumeHistory,
      );
    } catch (err) {
      return err;
    }
  }
}
