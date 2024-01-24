import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosError } from 'axios';
import { Model } from 'mongoose';
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

    let careerPathInfo: CareerPathDataDto = await this.careerPathDataModel.findOne({
      career_path_name: predictionResult.data
    }).exec();

    if(!careerPathInfo) {
      careerPathInfo = await this.careerPathDataModel.findOne({
        career_path_name: 'Unknown'
      }).exec();
    }

    const result: ICareerPredictionResult = {
      career: careerPathInfo.career_path_name,
      description: careerPathInfo.career_path_description,
      relatedCareers: careerPathInfo.related_careers,
      baseSalary: careerPathInfo.base_salary,
      careermatesCount: 0,
      icon: careerPathInfo.icon_svg,
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
