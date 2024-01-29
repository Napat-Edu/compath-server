import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosError } from 'axios';
import { Model } from 'mongoose';
import { catchError, firstValueFrom } from 'rxjs';
import { CareerPathDataDto } from 'src/dtos/career-path-data.dto';
import { ResumeInputDto } from 'src/dtos/resume-input.dto';
import { ICareerPredictionResult } from 'src/interfaces/career-prediction.interface';
import { CareerPathData } from 'src/schemas/career-path-data.schema';
import { ResumeHistory } from 'src/schemas/resume-history.schema';

@Injectable()
export class CareerPredictionService {
  private readonly logger = new Logger();

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(ResumeHistory.name)
    private resumeHistoryModel: Model<ResumeHistory>,
    @InjectModel(CareerPathData.name)
    private careerPathDataModel: Model<CareerPathData>,
  ) {}

  async getCareerPredictionResult(
    userResumeInput: ResumeInputDto,
  ): Promise<ICareerPredictionResult> {
    const predictionResult = await firstValueFrom(
      this.httpService
        .get(process.env.MODEL_API, {
          params: userResumeInput.resume_input,
        })
        .pipe(
          catchError((err: AxiosError) => {
            this.logger.error(err.response.data);
            throw 'error occured';
          }),
        ),
    );

    let careerPathInfo: CareerPathDataDto = await this.careerPathDataModel
      .findOne({
        career_path_name: predictionResult.data,
      })
      .exec();

    if (!careerPathInfo) {
      const careerUnkownData: CareerPathDataDto = {
        career_path_name: 'Unknown',
        career_path_description: 'server may cause some errors',
        related_careers: ['none'],
        base_salary: {
          min_salary: 0,
          max_salary: 0,
        },
        icon_svg: `
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
        <path d="M18.5 16L22.5 12L18.5 8" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6.5 8L2.5 12L6.5 16" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15 4L10 20" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
      };
      careerPathInfo = careerUnkownData;
    }

    const result: ICareerPredictionResult = {
      career: careerPathInfo.career_path_name,
      description: careerPathInfo.career_path_description,
      relatedCareers: careerPathInfo.related_careers,
      baseSalary: careerPathInfo.base_salary,
      careermatesCount: 0,
      icon: careerPathInfo.icon_svg,
    };

    const resumeHistory: ResumeInputDto = {
      resume_owner: userResumeInput.resume_owner ?? 'anonymous',
      resume_input: userResumeInput.resume_input,
      input_date: undefined,
      prediction_result: result.career,
    };
    this.createCareerPredictionHistory(resumeHistory);

    return result;
  }

  createCareerPredictionHistory(
    resumeInputDto: ResumeInputDto,
  ): Promise<ResumeHistory> {
    resumeInputDto.input_date = new Date();
    const createdResumeHistory = new this.resumeHistoryModel(resumeInputDto);
    return createdResumeHistory.save();
  }
}
