import { Controller, Get, Post } from '@nestjs/common';
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
  createCareerPredictionHistory(): any {
    const test: ResumeInputDto = {
      resume_owner: 'anonymous',
      resume_input: {
        educational: 'a',
        skill: 'b',
        experience: 'c',
      },
      input_date: new Date(),
    };
    return this.careerPredictionService.createCareerPredictionHistory(test);
  }
}
