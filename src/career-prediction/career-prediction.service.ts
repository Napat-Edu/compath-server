import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResumeInputDto } from 'src/dtos/resume-input.dto';
import { ResumeHistory } from 'src/schemas/resume-history.schema';

@Injectable()
export class CareerPredictionService {
  constructor(
    @InjectModel(ResumeHistory.name)
    private resumeHistoryModel: Model<ResumeHistory>,
  ) {}

  getCareerPredictionResult() {
    return { msg: 'Software Engineer' };
  }

  createCareerPredictionHistory(resumeInputDto: ResumeInputDto): Promise<ResumeHistory> {
    const createdResumeHistory = new this.resumeHistoryModel(resumeInputDto);
    return createdResumeHistory.save();
  }
}
