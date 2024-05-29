import { Injectable } from '@nestjs/common';
import { SkillDataDto } from 'src/dtos/skill-data.dto';
import { ICareerPathClassify } from 'src/interfaces/career-insight.interface';
import { sortByLocale, sortCareers } from './utils';

@Injectable()
export class CareerProcessorService {
  constructor() {}

  sortCareerPathData(careerPathData) {
    return careerPathData
      .sort(sortByLocale('career_path_name'))
      .map((careerPath) => ({
        ...careerPath,
        related_careers: sortCareers(careerPath.related_careers),
      }));
  }

  mapRelatedCareer(careerPathData, skillDatas, userResume) {
    return careerPathData.related_careers.map((career) => ({
      ...career,
      skill_domains: career.skill_domains.map((domain) => ({
        ...domain,
        skill_list: domain.skill_list.map((skill) =>
          this.classifyCoreSkill(skill, userResume.skill),
        ),
      })),
      alt_skills: this.classifyAlternativeSkill(skillDatas, userResume.skill),
    }));
  }

  classifyCoreSkill(skills: string[], userSkill: string) {
    const splittedUserSkill = this.splitUserSkill(userSkill);
    const isExisInResume = skills.some((skill) =>
      splittedUserSkill.some(
        (splitUserSkill) =>
          splitUserSkill.toLocaleLowerCase() == skill.toLocaleLowerCase(),
      ),
    );
    return { name: skills, isExisInResume };
  }

  classifyAlternativeSkill(skillDatas: SkillDataDto[], userSkill: string) {
    const splittedUserSkill = this.splitUserSkill(userSkill);
    return skillDatas
      .map((skillData) => ({
        name: skillData.name.filter((skill) =>
          splittedUserSkill.some(
            (splitUserSkill) =>
              splitUserSkill.toLocaleLowerCase() == skill.toLocaleLowerCase(),
          ),
        ),
      }))
      .filter((skill) => skill.name.length > 0);
  }

  splitUserSkill(userSkill: string) {
    return userSkill
      .replace(/[,\/]/g, '\n')
      .replace(/\((.*?)\)/g, (_, content) => `\n${content}\n`)
      .split('\n')
      .map((skill) => skill.trim());
  }

  removeDuplicateSkill(data: ICareerPathClassify) {
    return {
      ...data,
      related_careers: data.related_careers.map((career) => ({
        ...career,
        alt_skills: career.alt_skills.filter(
          (altSkill) =>
            !career.skill_domains.some((domain) =>
              domain.skill_list.some(
                (skill) => skill.name.join('') === altSkill.name.join(''),
              ),
            ),
        ),
      })),
    };
  }
}
