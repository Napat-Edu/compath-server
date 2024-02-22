import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CareerPredictionService } from './career-prediction.service';
import { ResumeInputDto } from 'src/dtos/resume-input.dto';

@Controller('/career-prediction')
export class CareerPredictionController {
  constructor(
    private readonly careerPredictionService: CareerPredictionService,
  ) {}

  @Get()
  getCareerPathInfo(@Query() query: { careerPath: string }) {
    return this.careerPredictionService.getCareerPathInfo(query.careerPath);
  }

  @Get('/insight')
  getCareerInsight(@Query() query: { careerPath: string; objectId: string }) {
    return this.careerPredictionService.getCareerInsight(
      query.careerPath,
      query.objectId,
    );
  }

  @Post()
  createCareerPrediction(@Body() userResumeInput: ResumeInputDto) {
    try {
      return this.careerPredictionService.createCareerPrediction(
        userResumeInput,
      );
    } catch (err) {
      return err;
    }
  }
}
