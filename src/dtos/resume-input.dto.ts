import { IResumeInput } from "src/interfaces/resume-input.interface";

export interface ResumeInputDto {
  resume_owner: string;
  resume_input: IResumeInput;
  input_date: Date;
}
