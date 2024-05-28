import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { IUserResumeInfo, IUserResumeInput } from 'src/interfaces/career-prediction.interface';

@Injectable()
export class CareerService {
  private readonly logger = new Logger();

  constructor(
    private readonly httpService: HttpService,
  ) { }

  async createResumeHistory(resume: IUserResumeInput) {
    try {
      const careerpath = await this.classificationCareerpath(resume.resume_input);
      return {};
    } catch (error) {
      return error;
    }
  }

  async classificationCareerpath(resumeInfo: IUserResumeInfo) {
    try {
      const predictionResult = await firstValueFrom(
        this.httpService.post(process.env.MODEL_API, resumeInfo).pipe(
          catchError((err: AxiosError) => {
            this.logger.error(err.response.data);
            throw 'error occured';
          }),
        ),
      );
      return predictionResult.data;
    } catch (error) {
      return error;
    }
  }
}
