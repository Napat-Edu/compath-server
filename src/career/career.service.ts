import { Injectable } from '@nestjs/common';
import { ResumeHistoryDto } from 'src/dtos/resume-input.dto';
import { SkillDataDto } from 'src/dtos/skill-data.dto';
import { ICareerPathClassify, ICareerPathWithSkill, ISkillType } from 'src/interfaces/career-insight.interface';
import { IResumePredictionResult, IUserResumeInput } from 'src/interfaces/career-prediction.interface';
import { CareerFactoryService } from 'src/services/career-factory.service';
import { DatabaseService } from 'src/services/database.service';
import { ExternalApiService } from 'src/services/external-api.service';

@Injectable()
export class CareerService {

  constructor(
    private readonly careerFactoryService: CareerFactoryService,
    private readonly databaseService: DatabaseService,
    private readonly externalApiService: ExternalApiService
  ) { }

  async createResumeHistory(resume: IUserResumeInput) {
    try {
      const careerPath = await this.externalApiService.classificationCareerpath(resume.resume_input);
      const careerPathInfo = await this.careerFactoryService.getCareerPathInfo(careerPath);
      const createdResumeHistory: ResumeHistoryDto = this.databaseService.createNewResumeHistory(resume, careerPathInfo);
      const careermateCount = await this.databaseService.countCareermate(careerPath)
      const result: IResumePredictionResult = {
        ...careerPathInfo,
        input_date: createdResumeHistory.input_date,
        object_id: createdResumeHistory._id,
        careermate_count: careermateCount,
      };
      return result;
    } catch (error) {
      return error;
    }
  }

  async createResumeHistoryByPDF(file: Express.Multer.File, owner: string) {
    try {
      const buffer = Buffer.from(file.buffer).toString('base64');
      const parsedResumeText = await this.externalApiService.ocrResume(buffer);
      const newResumeObj: IUserResumeInput = {
        resume_owner: owner || 'anonymous',
        resume_input: {
          skill: parsedResumeText,
          educational: ' ',
          experience: ' ',
          agreement: true,
        },
      };
      return this.createResumeHistory(newResumeObj);
    } catch (error) {
      return error;
    }
  }

  async getResumeHistory(email: string) {
    try {
      return this.databaseService.findResumeHistoryByEmail(email);
    } catch (error) {
      return error;
    }
  }

  async deleteResumeHistory(id: string) {
    try {
      return this.databaseService.deleteResumeHistoryById(id);
    } catch (error) {
      return error;
    }
  }

  async GetAllCareerData() {
    const careerPathData = await this.databaseService.getAllCareerData();

    const sortedCareerPathData = careerPathData
      .sort((a, b) => a.career_path_name.localeCompare(b.career_path_name))
      .map((careerPath) => {
        const sortedCareerPath = careerPath.related_careers.sort((a, b) =>
          a.career.localeCompare(b.career),
        );
        return {
          ...careerPath,
          related_careers: sortedCareerPath.map((career) => {
            const sortedSkillDomain = career.skill_domains.sort((a, b) =>
              a.id.localeCompare(b.id),
            );
            const mappedSkillDomain = sortedSkillDomain.map((domain) => {
              return {
                ...domain,
                skill_list: domain.skill_list.sort((a, b) =>
                  a[0].localeCompare(b[0]),
                ),
              };
            });
            return {
              ...career,
              soft_skills: career.soft_skills.sort((a, b) =>
                a.id.localeCompare(b.id),
              ),
              skill_domains: mappedSkillDomain,
            };
          }),
        };
      });

    return sortedCareerPathData;
  }

  async GetCareerData(careerPath: string, objectId: string) {
    const skillDatas: SkillDataDto[] = await this.databaseService.getAllSkillData();
    const careerPathData: ICareerPathWithSkill = await this.databaseService.getCareerPathDataWithSkill(careerPath);
    const userResumeHistory = await this.databaseService.findResumeHistoryById(objectId);
    const userResume = userResumeHistory.resume_input;
    const careermateCount = await this.databaseService.countCareermate(careerPath);

    const mappedRelatedCareer = careerPathData.related_careers.map((career) => {
      return {
        ...career,
        skill_domains: career.skill_domains.map((domain) => {
          return {
            ...domain,
            skill_list: domain.skill_list.map((skill): ISkillType => {
              return this.classifyCoreSkill(skill, userResume.skill);
            }),
          };
        }),
        alt_skills: this.classifyAlternativeSkill(skillDatas, userResume.skill),
      };
    });

    const classifiedInsightData: ICareerPathClassify = {
      ...careerPathData,
      related_careers: mappedRelatedCareer,
      careermate_count: careermateCount,
    };

    const uniqueInsightData = this.removeDuplicateSkill(classifiedInsightData);
    const sortedInsightData = {
      ...uniqueInsightData,
      related_careers: uniqueInsightData.related_careers.sort((a, b) =>
        a.career.localeCompare(b.career),
      ),
    };

    return sortedInsightData;
  }

  classifyCoreSkill(skills: string[], userSkill: string) {
    const splittedUserSkill = this.splitUserSkill(userSkill);
    const isExisInResume = skills.some((skill) =>
      splittedUserSkill.some(
        (splitUserSkill) =>
          splitUserSkill.toLocaleLowerCase() == skill.toLocaleLowerCase(),
      ),
    );
    return {
      name: skills,
      isExisInResume: isExisInResume,
    };
  }

  classifyAlternativeSkill(skillDatas: SkillDataDto[], userSkill: string) {
    const splittedUserSkill = this.splitUserSkill(userSkill);
    const classifiedSkill = skillDatas.map((skillData) => {
      if (
        skillData.name.some((skill) =>
          splittedUserSkill.some(
            (splitUserSkill) =>
              splitUserSkill.toLocaleLowerCase() == skill.toLocaleLowerCase(),
          ),
        )
      ) {
        return { name: skillData.name };
      } else {
        return { name: [] };
      }
    });
    const filteredSkill = classifiedSkill.filter(
      (skill) => skill.name.length > 0,
    );
    return filteredSkill;
  }

  splitUserSkill(userSkill: string) {
    const userSkillWithLineBreak = userSkill
      .replace(/[,\/]/g, '\n')
      .replace(/\((.*?)\)/g, (_, content) => `\n${content}\n`);
    const splittedUserSkill = userSkillWithLineBreak.split('\n');
    const trimmedUserSkill = splittedUserSkill.map((userSkill) =>
      userSkill.trim(),
    );
    return trimmedUserSkill;
  }

  removeDuplicateSkill(data: ICareerPathClassify) {
    const uniqedData: ICareerPathClassify = {
      ...data,
      related_careers: data.related_careers.map((career) => {
        const currentCareerDomain = career.skill_domains;
        return {
          ...career,
          alt_skills: career.alt_skills.filter((altSkill) => {
            return !currentCareerDomain.some((domain) => {
              return domain.skill_list.some((skill) => {
                return skill.name.join('') == altSkill.name.join('');
              });
            });
          }),
        };
      }),
    };
    return uniqedData;
  }
}
