import { ICareerPathBaseData } from 'src/dtos/career-path-data.dto';

export interface ICareerInsightRequest {
  career_path: string;
  object_id: string;
}

export interface ICareerPathWithSkill extends ICareerPathBaseData {
  related_careers: ICareerDomain[];
}

export interface ICareerDomain {
  career: string;
  skill_domains: ISkill[];
}

export interface ISkill {
  id: string;
  name: string;
  skill_list: string[][];
}

export interface ICareerPathClassify extends ICareerPathBaseData {
  related_careers: ICareerDomainClassify[];
  careermate_count: number;
}

export interface ICareerDomainClassify {
  career: string;
  skill_domains: ISkillClassify[];
  alt_skills: ISkillBase[];
}

export interface ISkillClassify {
  id: string;
  name: string;
  skill_list: ISkillType[];
}

export interface ISkillType extends ISkillBase {
  isExisInResume: boolean;
}

export interface ISkillBase {
  name: string[];
}
