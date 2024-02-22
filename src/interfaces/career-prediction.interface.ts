import { ObjectId } from 'mongoose';

export interface IUserResume {
  skill: string;
  educational: string;
  experience: string;
  agreement: boolean;
}

export interface ICareer {
  career: string;
  skillDomains: string[];
}

export interface ICareerPredictionResult {
  career: string;
  description: string;
  relatedCareers: ICareer[];
  baseSalary: ISalary;
  careermatesCount: number;
  icon: string;
  inputDate: Date;
  objectId: ObjectId;
}

export interface ISalary {
  min_salary: number;
  max_salary: number;
}
