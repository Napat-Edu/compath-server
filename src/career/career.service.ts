import { Injectable } from '@nestjs/common';
import { ResumeHistoryDto } from 'src/dtos/resume-input.dto';
import { IResumePredictionResult, IUserResumeInput } from 'src/interfaces/career-prediction.interface';
import { CareerFactoryService } from 'src/services/career-factory.service';
import { DatabaseService } from 'src/services/database.service';
import { ExternalApiService } from 'src/services/external-api.service';

@Injectable()
export class CareerService {

  constructor(
    private readonly careerFactoryService: CareerFactoryService,
    private readonly databaseService: DatabaseService,
    private readonly externalApiService: ExternalApiService
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
}
