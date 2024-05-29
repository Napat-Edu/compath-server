import { Injectable } from '@nestjs/common';
import { SkillDataDto } from 'src/dtos/skill-data.dto';
import { ICareerPathClassify } from 'src/interfaces/career-insight.interface';

@Injectable()
export class CareerProcessorService {
  constructor() { }

  localeCompareByKey(key: string | number, object: any) {
    return object.sort((a, b) => a[key].localeCompare(b[key]));
  }

  sortCareerPathData(careerPathData) {
    return this.localeCompareByKey('career_path_name', careerPathData)
      .map((careerPath) => ({
        ...careerPath,
        related_careers: this.sortCareers(careerPath.related_careers),
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

  removeDuplicateSkill(data: ICareerPathClassify) {
    const newRelatedCareers = data.related_careers.map((career) => ({
      ...career,
      alt_skills: career.alt_skills.filter((altSkill) => !this.isDuplicate(career, altSkill)),
    }));

    return {
      ...data,
      related_careers: newRelatedCareers,
    };
  }

  private classifyCoreSkill(skills: string[], userSkill: string) {
    const splittedUserSkill = this.splitUserSkill(userSkill);
    const isExisInResume = skills.some((skill) =>
      splittedUserSkill.some(
        (splitUserSkill) =>
          splitUserSkill.toLocaleLowerCase() == skill.toLocaleLowerCase(),
      ),
    );
    return { name: skills, isExisInResume };
  }

  private classifyAlternativeSkill(skillDatas: SkillDataDto[], userSkill: string) {
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

  private splitUserSkill(userSkill: string) {
    return userSkill
      .replace(/[,\/]/g, '\n')
      .replace(/\((.*?)\)/g, (_, content) => `\n${content}\n`)
      .split('\n')
      .map((skill) => skill.trim());
  }

  private sortCareers(careers) {
    return this.localeCompareByKey('career', careers)
      .map((career) => ({
        ...career,
        soft_skills: this.localeCompareByKey('id', career.soft_skills),
        skill_domains: this.sortSkillDomains(career.skill_domains),
      }));
  }

  private sortSkillDomains(domains) {
    return this.localeCompareByKey('id', domains)
      .map((domain) => ({
        ...domain,
        skill_list: this.localeCompareByKey(0, domain.skill_list)
      }));
  }

  private isDuplicate(career, altSkill) {
    return career.skill_domains.some((domain) =>
      domain.skill_list.some(
        (skill) => skill.name.join('') === altSkill.name.join(''),
      ),
    );
  }
}
