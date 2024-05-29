import { Injectable } from '@nestjs/common';
import { ResumeHistoryDto } from 'src/dtos/resume-input.dto';
import { SkillDataDto } from 'src/dtos/skill-data.dto';
import { ICareerPathClassify, ICareerPathWithSkill, ISkillType } from 'src/interfaces/career-insight.interface';
import { IResumePredictionResult, IUserResumeInput } from 'src/interfaces/career-prediction.interface';
import { CareerFactoryService } from 'src/services/career-factory.service';
import { CareerProcessorService } from 'src/services/career-processor.service';
import { DatabaseService } from 'src/services/database.service';
import { ExternalApiService } from 'src/services/external-api.service';
import { sortByLocale } from 'src/services/utils';

@Injectable()
export class CareerService {

  constructor(
    private readonly careerFactoryService: CareerFactoryService,
    private readonly databaseService: DatabaseService,
    private readonly externalApiService: ExternalApiService,
    private readonly careerProcessorService: CareerProcessorService
  ) { }

  async createResumeHistory(resume: IUserResumeInput) {
    try {
      const careerPath = await this.externalApiService.classificationCareerpath(resume.resume_input);
      const careerPathInfo = await this.careerFactoryService.getCareerPathInfo(careerPath);
      const createdResumeHistory: ResumeHistoryDto = this.databaseService.createNewResumeHistory(resume, careerPathInfo);
      const careermateCount = await this.databaseService.countCareermate(careerPath)
      const result: IResumePredictionResult = {
        ...careerPathInfo,
        input_date: createdResumeHistory.input_date,
        object_id: createdResumeHistory._id,
        careermate_count: careermateCount,
      };
      return result;
    } catch (error) {
      return error;
    }
  }

  async createResumeHistoryByPDF(file: Express.Multer.File, owner: string) {
    try {
      const buffer = Buffer.from(file.buffer).toString('base64');
      const parsedResumeText = await this.externalApiService.ocrResume(buffer);
      const newResumeObj: IUserResumeInput = {
        resume_owner: owner || 'anonymous',
        resume_input: {
          skill: parsedResumeText,
          educational: ' ',
          experience: ' ',
          agreement: true,
        },
      };
      return this.createResumeHistory(newResumeObj);
    } catch (error) {
      return error;
    }
  }

  async getResumeHistory(email: string) {
    try {
      return this.databaseService.findResumeHistoryByEmail(email);
    } catch (error) {
      return error;
    }
  }

  async deleteResumeHistory(id: string) {
    try {
      return this.databaseService.deleteResumeHistoryById(id);
    } catch (error) {
      return error;
    }
  }

  async getAllCareerData() {
    const careerPathData = await this.databaseService.getAllCareerData();
    const sortedCareerPathData = this.careerProcessorService.sortCareerPathData(careerPathData);
    return sortedCareerPathData;
  }

  async getCareerData(careerPath: string, objectId: string) {
    const skillDatas: SkillDataDto[] = await this.databaseService.getAllSkillData();
    const careerPathData: ICareerPathWithSkill = await this.databaseService.getCareerPathDataWithSkill(careerPath);
    const userResumeHistory = await this.databaseService.findResumeHistoryById(objectId);
    const userResume = userResumeHistory.resume_input;
    const careermateCount = await this.databaseService.countCareermate(careerPath);

    const mappedRelatedCareer = this.careerProcessorService.mapRelatedCareer(careerPathData, skillDatas, userResume);

    const classifiedInsightData: ICareerPathClassify = {
      ...careerPathData,
      related_careers: mappedRelatedCareer,
      careermate_count: careermateCount,
    };

    const uniqueInsightData = this.careerProcessorService.removeDuplicateSkill(classifiedInsightData);
    const sortedInsightData = {
      ...uniqueInsightData,
      related_careers: uniqueInsightData.related_careers.sort(sortByLocale('career')),
    };

    return sortedInsightData;
  }
}
