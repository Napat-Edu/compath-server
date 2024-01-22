import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CareerPredictionService } from './career-prediction.service';
import { ResumeInputDto } from 'src/dtos/resume-input.dto';
import { IUserResume } from 'src/interfaces/career-prediction.interface';

@Controller('/career-prediction')
export class CareerPredictionController {
  constructor(
    private readonly careerPredictionService: CareerPredictionService,
  ) {}

  @Get()
  getCareerPrediction(@Query() userResumeInput: IUserResume): any {
    return this.careerPredictionService.getCareerPredictionResult(userResumeInput);
  }

  @Post('/create/resume-history')
  createCareerPredictionHistory(@Body() newResumeHistory: ResumeInputDto) {
    try {
      newResumeHistory.input_date = new Date();
      return this.careerPredictionService.createCareerPredictionHistory(
        newResumeHistory,
      );
    } catch (err) {
      return err;
    }
  }
}
