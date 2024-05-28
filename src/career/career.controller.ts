import { Body, Controller, Post } from '@nestjs/common';
import { CareerService } from './career.service';
import { IUserResumeInput } from 'src/interfaces/career-prediction.interface';

@Controller('/career')
export class CareerController {
  constructor(
    private readonly careerService: CareerService
  ) { }

  @Post()
  createResumeHistory(@Body() resume: IUserResumeInput) {
    try {
      return this.careerService.createResumeHistory(resume);
    } catch (error) {
      return error;
    }
  }
}
