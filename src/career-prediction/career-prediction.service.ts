import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosError } from 'axios';
import { Model, ObjectId } from 'mongoose';
import { catchError, firstValueFrom } from 'rxjs';
import { CareerPathDataDto } from 'src/dtos/career-path-data.dto';
import { ResumeInputDto } from 'src/dtos/resume-input.dto';
import {
  ICareerPredictionResult,
  IUserResume,
} from 'src/interfaces/career-prediction.interface';
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

  async createCareerPredictionResult(
    userResumeInput: ResumeInputDto,
  ): Promise<ICareerPredictionResult> {
    const predictionCareer = await this.getCareerPrediction(
      userResumeInput.resume_input,
    );

    let careerPathInfo: ICareerPredictionResult =
      await this.getCareerPathInfo(predictionCareer);

    if (!careerPathInfo) {
      const careerUnkownData: ICareerPredictionResult = {
        career: 'Unknown',
        description: 'server may cause some errors',
        relatedCareers: ['none'],
        baseSalary: {
          min_salary: 0,
          max_salary: 0,
        },
        icon: `
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
        <path d="M18.5 16L22.5 12L18.5 8" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6.5 8L2.5 12L6.5 16" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15 4L10 20" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
        careermatesCount: 0,
        objectId: null,
        inputDate: undefined,
      };
      careerPathInfo = careerUnkownData;
    }

    const result: ICareerPredictionResult = careerPathInfo;

    const resumeHistory: ResumeInputDto = {
      resume_owner: userResumeInput.resume_owner ?? 'anonymous',
      resume_input: userResumeInput.resume_input,
      input_date: undefined,
      prediction_result: result.career,
    };
    const newPredictionDoc: any =
      await this.createCareerPredictionHistory(resumeHistory);
    result.objectId = newPredictionDoc._id;
    result.inputDate = newPredictionDoc.input_date;

    return result;
  }

  async getCareerPrediction(data: IUserResume) {
    const predictionResult = await firstValueFrom(
      this.httpService.post(process.env.MODEL_API, data).pipe(
        catchError((err: AxiosError) => {
          this.logger.error(err.response.data);
          throw 'error occured';
        }),
      ),
    );
    return predictionResult.data;
  }

  async getCareerPathInfo(careerPath: string) {
    try {
      const careerInfo = await this.careerPathDataModel
        .findOne({
          career_path_name: careerPath,
        })
        .exec();
      const result: ICareerPredictionResult = {
        career: careerInfo.career_path_name,
        description: careerInfo.career_path_description,
        relatedCareers: careerInfo.related_careers,
        baseSalary: careerInfo.base_salary,
        careermatesCount: 0,
        icon: careerInfo.icon_svg,
        objectId: null,
        inputDate: undefined,
      };
      return result;
    } catch (error) {
      return error;
    }
  }

  createCareerPredictionHistory(
    resumeInputDto: ResumeInputDto,
  ): Promise<ResumeHistory> {
    resumeInputDto.input_date = new Date();
    const createdResumeHistory = new this.resumeHistoryModel(resumeInputDto);
    return createdResumeHistory.save();
  }
}
