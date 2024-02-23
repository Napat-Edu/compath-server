export interface CareerPathDataDto {
  career_path_name: string;
  career_path_description: string;
  related_careers: CareerDto[];
  base_salary: ISalary;
  icon_svg: string;
}

export interface CareerDto {
  career: string;
  skill_domains: string[];
}

export interface ISalary {
  min_salary: number;
  max_salary: number;
}
