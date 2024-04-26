import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { CareerService } from './career.service';
import { IUserResumeInput } from 'src/interfaces/career-prediction.interface';
import { ICareerInsightRequest } from 'src/interfaces/career-insight.interface';

@Controller('/career')
export class CareerController {
  constructor(private readonly careerService: CareerService) {}

  @Get()
  getCareerData(@Query() query: ICareerInsightRequest) {
    try {
      return this.careerService.getCareerData(query.career_path, query.object_id);
    } catch (err) {
      return err;
    }
  }

  @Get('history')
  getPredictionHistory(@Query() query: { email: string }) {
    try {
      return this.careerService.getPredictionHistory(query.email);
    } catch (err) {
      return err;
    }
  }

  @Post('history')
  createPredictionHistory(@Body() userResumeInput: IUserResumeInput) {
    try {
      return this.careerService.createCareerPrediction(userResumeInput);
    } catch (err) {
      return err;
    }
  }

  @Delete('history')
  deletePredictionHistory(@Query() query: { id: string }) {
    try {
      return this.careerService.deletePredictionHistory(query.id);
    } catch (err) {
      return err;
    }
  }
}
