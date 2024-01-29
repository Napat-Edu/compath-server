export interface ICareerPredictionResult {
  career: string;
  description: string;
  relatedCareers: string[];
  baseSalary: ISalary;
  careermatesCount: number;
  icon: string;
}

export interface ISalary {
  min_salary: number;
  max_salary: number;
}