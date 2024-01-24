import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosError } from 'axios';
import { Model } from 'mongoose';
import { catchError, firstValueFrom } from 'rxjs';
import { ResumeInputDto } from 'src/dtos/resume-input.dto';
import {
  ICareerPredictionResult,
  IUserResume,
} from 'src/interfaces/career-prediction.interface';
import { ResumeHistory } from 'src/schemas/resume-history.schema';

@Injectable()
export class CareerPredictionService {
  private readonly logger = new Logger();

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(ResumeHistory.name)
    private resumeHistoryModel: Model<ResumeHistory>,
  ) {}

  async getCareerPredictionResult(
    userResumeInput: IUserResume,
  ): Promise<ICareerPredictionResult> {
    const predictionResult = await firstValueFrom(
      this.httpService
        .get(process.env.MODEL_API, {
          params: userResumeInput,
        })
        .pipe(
          catchError((err: AxiosError) => {
            this.logger.error(err.response.data);
            throw 'error occured';
          }),
        ),
    );

    const result: ICareerPredictionResult = {
      career: predictionResult.data,
      description: 'ผู้สร้างสรรค์ซอฟต์แวร์ขึ้นมาให้เป็นจริง',
      relatedCareers: [
        'frontend developer',
        'backend developer',
        'full-stack developer',
      ],
      baseSalary: 30000,
      careermatesCount: 0,
      icon: `
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
      <path d="M18.5 16L22.5 12L18.5 8" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6.5 8L2.5 12L6.5 16" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15 4L10 20" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>      
      `,
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
