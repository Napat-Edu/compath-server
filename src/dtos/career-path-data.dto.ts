export interface CareerPathDataDto extends ICareerPathBaseData {
  related_careers: CareerDto[];
}

export interface CareerDto {
  career: string;
  skill_domains: string[];
}

export interface ICareerPathBaseData {
  career_path_name: string;
  career_path_description: string;
  base_salary: ISalary;
  icon_svg: string;
}

export interface ISalary {
  min_salary: number;
  max_salary: number;
}
