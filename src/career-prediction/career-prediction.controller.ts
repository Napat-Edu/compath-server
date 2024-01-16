import { Body, Controller, Get, Post } from '@nestjs/common';
import { CareerPredictionService } from './career-prediction.service';
import { ResumeInputDto } from 'src/dtos/resume-input.dto';

@Controller('/career-prediction')
export class CareerPredictionController {
  constructor(
    private readonly careerPredictionService: CareerPredictionService,
  ) {}

  @Get()
  getCareerPrediction(): any {
    return this.careerPredictionService.getCareerPredictionResult();
  }

  @Post('/create/resume-history')
  createCareerPredictionHistory(@Body() newResumeHistory: ResumeInputDto) {
    try {
      newResumeHistory.input_date = new Date();
      return this.careerPredictionService.createCareerPredictionHistory(newResumeHistory);
    } catch (err) {
      return err;
    }
  }
}
