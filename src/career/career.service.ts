import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { DatabaseService, ResumeService } from 'src/app.service';
import { SkillDataDto } from 'src/dtos/skill-data.dto';
import {
  ICareerPathClassify,
  ICareerPathWithSkill,
  ISkillType,
} from 'src/interfaces/career-insight.interface';
import {
  IResumePredictionResult,
  IUserResumeInfo,
  IUserResumeInput,
} from 'src/interfaces/career-prediction.interface';

@Injectable()
export class CareerService {
  private readonly logger = new Logger();

  constructor(
    private readonly httpService: HttpService,
    private databaseService: DatabaseService,
    private resumeService: ResumeService,
  ) {}

  async createCareerPrediction(userResumeInput: IUserResumeInput) {
    const careerPath = await this.classificationCareerPath(userResumeInput.resume_input);
    const careerPathInfo = await this.databaseService.getCareerPathInfo(careerPath);
    const createdHistory = await this.databaseService.createNewHistory(
      userResumeInput.resume_owner,
      userResumeInput.resume_input,
      careerPathInfo.career_path_name,
    );
    const careermate_count = await this.resumeService.countCareermate(careerPath);

    const result: IResumePredictionResult = {
      ...careerPathInfo,
      input_date: createdHistory.input_date,
      object_id: createdHistory._id,
      careermate_count: careermate_count,
    };
    return result;
  }

  async classificationCareerPath(resume: IUserResumeInfo) {
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

  getCareerData(careerPath: string, objectId: string) {
    try {
      if(!careerPath || !objectId) {
        return this.getExplorationData();
      } else {
        return this.getCareerInsight(careerPath, objectId);
      }
    } catch (error) {
      return error;
    }
  }

  async getPredictionHistory(email: string) {
    const histories = await this.databaseService.getPredictionHistoriesByEmail(email);
    return histories;
  }

  async deletePredictionHistory(id: string) {
    const result = await this.databaseService.deletePredictionHistoryById(id);
    return result;
  }

  async getCareerInsight(careerPath: string, objectId: string) {
    try {
      const skillDatas: SkillDataDto[] = await this.databaseService.getAllSkillData();
      const careerPathData: ICareerPathWithSkill = await this.databaseService.getCareerPathDataWithSkill(careerPath);
      const userResumeHistory = await this.databaseService.getPredictionHistoryById(objectId);

      const careermate_count = await this.resumeService.countCareermate(careerPath);
      const mappedRelatedCareer = this.resumeService.mapCareerAndSkill(careerPathData, skillDatas, userResumeHistory.resume_input);

      const classifiedInsightData: ICareerPathClassify = {
        ...careerPathData,
        related_careers: mappedRelatedCareer,
        careermate_count: careermate_count,
      };
      const uniqueInsightData = this.resumeService.removeDuplicateSkill(classifiedInsightData);

      const sortedInsightData = {
        ...uniqueInsightData,
        related_careers: uniqueInsightData.related_careers.sort((a, b) =>
          a.career.localeCompare(b.career),
        ),
      };

      return sortedInsightData;
    } catch (error) {
      return { msg: "can't find this specific object, invalid object_id" };
    }
  }

  async getExplorationData() {
    const careerPathData = await this.databaseService.getAllCareerData();
    const sortedCareerPathData = this.resumeService.sortCareerData(careerPathData);
    return sortedCareerPathData;
  }
}
