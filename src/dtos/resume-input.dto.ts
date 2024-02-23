import { ObjectId } from 'mongoose';
import { IUserResumeInput } from 'src/interfaces/career-prediction.interface';

export interface ResumeHistoryDto extends IUserResumeInput {
  input_date: Date;
  prediction_result: string;
  _id?: ObjectId;
}
