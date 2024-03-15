import { ObjectId } from 'mongoose';
import { CareerPathDataDto } from 'src/dtos/career-path-data.dto';

export interface IUserResumeInput {
  resume_owner: string | 'anonymous';
  resume_input: IUserResumeInfo;
}

export interface IUserResumeInfo {
  skill: string;
  educational: string;
  experience: string;
  agreement: boolean;
}

export interface IResumePredictionResult extends CareerPathDataDto {
  careermate_count: number;
  input_date: Date;
  object_id: ObjectId;
}
