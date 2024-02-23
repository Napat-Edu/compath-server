import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosError } from 'axios';
import { Model } from 'mongoose';
import { catchError, firstValueFrom } from 'rxjs';
import { CareerPathDataDto } from 'src/dtos/career-path-data.dto';
import { ResumeHistoryDto } from 'src/dtos/resume-input.dto';
import {
  IResumePredictionResult,
  IUserResumeInfo,
  IUserResumeInput,
} from 'src/interfaces/career-prediction.interface';
import { CareerPathData } from 'src/schemas/career-path-data.schema';
import { ResumeHistory } from 'src/schemas/resume-history.schema';

@Injectable()
export class CareerPredictionService {
  private readonly logger = new Logger();

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(CareerPathData.name)
    private careerPathDataModel: Model<CareerPathData>,
    @InjectModel(ResumeHistory.name)
    private resumeHistoryModel: Model<ResumeHistory>,
  ) {}

  async createCareerPrediction(userResumeInput: IUserResumeInput) {
    const careerPath = await this.predictCareerPath(
      userResumeInput.resume_input,
    );

    const careerPathInfo = await this.findCareerPathInfo(careerPath);

    const newResumeHistory: ResumeHistoryDto = {
      resume_owner: userResumeInput.resume_owner,
      resume_input: userResumeInput.resume_input,
      input_date: new Date(),
      prediction_result: careerPathInfo.career_path_name,
    };
    const createdResumeHistory: ResumeHistoryDto =
      await this.createNewResumeHistory(newResumeHistory);

    const result: IResumePredictionResult = {
      ...careerPathInfo,
      input_date: createdResumeHistory.input_date,
      object_id: createdResumeHistory._id,
      careermate_count: 0,
    };

    return result;
  }

  async findCareerPathInfo(careerPath: string) {
    try {
      let careerPathInfo: CareerPathDataDto = await this.careerPathDataModel
        .findOne({
          career_path_name: careerPath,
        })
        .exec();

      if (!careerPathInfo) {
        careerPathInfo = await this.careerPathDataModel
          .findOne({
            career_path_name: 'Unknown',
          })
          .exec();
      }
      const jsonCareerPathInfo = JSON.stringify(careerPathInfo);
      const parsedCareerPathInfo = JSON.parse(jsonCareerPathInfo);
      return parsedCareerPathInfo;
    } catch (err) {
      return err;
    }
  }

  async predictCareerPath(resume: IUserResumeInfo) {
    const predictionResult = await firstValueFrom(
      this.httpService.post(process.env.MODEL_API, resume).pipe(
        catchError((err: AxiosError) => {
          this.logger.error(err.response.data);
          throw 'error occured';
        }),
      ),
    );
    return predictionResult.data;
  }

  createNewResumeHistory(
    newResumeHistory: ResumeHistoryDto,
  ): Promise<ResumeHistory> {
    try {
      const createdResumeHistory = new this.resumeHistoryModel(
        newResumeHistory,
      );
      return createdResumeHistory.save();
    } catch (err) {
      return err;
    }
  }
}
