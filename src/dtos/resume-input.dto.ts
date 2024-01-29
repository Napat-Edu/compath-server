import { IUserResume } from "src/interfaces/career-prediction.interface";

export interface ResumeInputDto {
  resume_owner?: string;
  resume_input: IUserResume;
  input_date: Date;
  prediction_result: string;
}
