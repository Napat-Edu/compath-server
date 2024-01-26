import { ISalary } from "src/interfaces/career-prediction.interface";

export interface CareerPathDataDto {
  career_path_name: string;
  career_path_description: string;
  related_careers: string[];
  base_salary: ISalary;
  icon_svg: string;
}
