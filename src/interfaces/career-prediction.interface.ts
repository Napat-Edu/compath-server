import { ObjectId } from 'mongoose';

export interface IUserResume {
  skill: string;
  educational: string;
  experience: string;
  agreement: boolean;
}

export interface ICareerPredictionResult {
  career: string;
  description: string;
  relatedCareers: string[];
  baseSalary: ISalary;
  careermatesCount: number;
  icon: string;
  objectId: ObjectId;
}

export interface ISalary {
  min_salary: number;
  max_salary: number;
}
