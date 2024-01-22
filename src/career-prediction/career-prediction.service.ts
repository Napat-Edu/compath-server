import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResumeInputDto } from 'src/dtos/resume-input.dto';
import {
  ICareerPredictionResult,
  IUserResume,
} from 'src/interfaces/career-prediction.interface';
import { ResumeHistory } from 'src/schemas/resume-history.schema';

@Injectable()
export class CareerPredictionService {
  constructor(
    @InjectModel(ResumeHistory.name)
    private resumeHistoryModel: Model<ResumeHistory>,
  ) {}

  getCareerPredictionResult(
    userResumeInput: IUserResume,
  ): ICareerPredictionResult {
    console.log(userResumeInput);
    const result: ICareerPredictionResult = {
      career: 'Software Engineer',
      description: 'ผู้สร้างสรรค์ซอฟต์แวร์ขึ้นมาให้เป็นจริง',
      relatedCareers: [
        'frontend developer',
        'backend developer',
        'full-stack developer',
      ],
      baseSalary: 30000,
      careermatesCount: 10,
      icon: `
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
      <path d="M18.5 16L22.5 12L18.5 8" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6.5 8L2.5 12L6.5 16" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15 4L10 20" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>      
      `
    };
    return result;
  }

  createCareerPredictionHistory(
    resumeInputDto: ResumeInputDto,
  ): Promise<ResumeHistory> {
    const createdResumeHistory = new this.resumeHistoryModel(resumeInputDto);
    return createdResumeHistory.save();
  }
}
