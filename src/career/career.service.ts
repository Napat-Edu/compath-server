import { Injectable } from '@nestjs/common/decorators';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResumeHistory } from 'src/schemas/resume-history.schema';

@Injectable()
export class CareerService {
  constructor(
    @InjectModel(ResumeHistory.name)
    private resumeHistoryModel: Model<ResumeHistory>,
  ) {}

  async getPredictionHistory(email: string) {
    const histories = await this.resumeHistoryModel
      .find({
        resume_owner: email,
      })
      .exec();
    return histories;
  }

  async deletePredictionHistory(id: string) {
    const result = await this.resumeHistoryModel.deleteOne({ _id: id });
    if (result.acknowledged) {
      return { msg: 'delete successful' };
    } else {
      return { msg: 'error occured' };
    }
  }
}
