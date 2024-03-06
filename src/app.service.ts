import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ResumeHistory } from './schemas/resume-history.schema';
import { Model } from 'mongoose';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(ResumeHistory.name)
    private resumeHistoryModel: Model<ResumeHistory>,
  ) {}

  getHello(): string {
    return `This is ${process.env.MODE} mode`;
  }

  async countCareermate(careerPath: string): Promise<number> {
    try {
      const careermate_count = await this.resumeHistoryModel
        .countDocuments({
          prediction_result: careerPath,
          $and: [
            { 'resume_input.skill': { $nin: ['-', '.'] } },
            { 'resume_input.experience': { $nin: ['-', '.'] } },
          ],
        })
        .exec();
      return careermate_count;
    } catch (err) {
      return err;
    }
  }
}
