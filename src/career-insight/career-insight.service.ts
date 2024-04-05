import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppService } from 'src/app.service';
import { SkillDataDto } from 'src/dtos/skill-data.dto';
import {
  ICareerPathClassify,
  ICareerPathWithSkill,
  ISkillType,
} from 'src/interfaces/career-insight.interface';
import { CareerPathData } from 'src/schemas/career-path-data.schema';
import { ResumeHistory } from 'src/schemas/resume-history.schema';
import { SkillData } from 'src/schemas/skill-data.schema';

@Injectable()
export class CareerInsightService {
  constructor(
    @InjectModel(ResumeHistory.name)
    private resumeHistoryModel: Model<ResumeHistory>,
    @InjectModel(CareerPathData.name)
    private careerPathDataModel: Model<CareerPathData>,
    @InjectModel(SkillData.name)
    private skillDataModel: Model<SkillData>,
    private appService: AppService,
  ) {}

  async getCareerInsight(careerPath: string, objectId: string) {
    const skillDatas: SkillDataDto[] = await this.skillDataModel.find().exec();
    const careerPathData: ICareerPathWithSkill =
      await this.getCareerPathDataWithSkill(careerPath);
    const userResumeHistory = await this.resumeHistoryModel
      .findById(objectId)
      .exec();
    const userResume = userResumeHistory.resume_input;

    const careermate_count = await this.appService.countCareermate(careerPath);

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
      careermate_count: careermate_count,
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

  async getCareerPathDataWithSkill(careerPath: string) {
    try {
      const careerInfo: ICareerPathWithSkill = await this.careerPathDataModel
        .aggregate([
          {
            $match: {
              career_path_name: careerPath,
            },
          },
          {
            $unwind: '$related_careers',
          },
          {
            $lookup: {
              from: 'skilldomains',
              localField: 'related_careers.skill_domains',
              foreignField: 'id',
              as: 'career_domains',
            },
          },
          {
            $unwind: '$career_domains',
          },
          {
            $lookup: {
              from: 'skilldatas',
              localField: 'career_domains.skill_list',
              foreignField: 'id',
              as: 'skill_data',
            },
          },
          {
            $group: {
              _id: {
                career_path_id: '$_id',
                career_path_name: '$career_path_name',
                career_path_description: '$career_path_description',
                base_salary: '$base_salary',
                career: '$related_careers.career',
              },
              skill_domains: {
                $push: {
                  id: '$career_domains.id',
                  name: '$career_domains.name',
                  skill_list: '$skill_data.name',
                  is_in_resume: '$career_domains.is_in_resume',
                },
              },
            },
          },
          {
            $group: {
              _id: '$_id.career_path_id',
              career_path_name: { $first: '$_id.career_path_name' },
              career_path_description: {
                $first: '$_id.career_path_description',
              },
              base_salary: { $first: '$_id.base_salary' },
              related_careers: {
                $push: {
                  career: '$_id.career',
                  skill_domains: '$skill_domains',
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              career_path_name: 1,
              career_path_description: 1,
              related_careers: 1,
              base_salary: 1,
            },
          },
        ])
        .then((data) => data[0]);

      const careerPathInfoWithSkill: ICareerPathWithSkill = careerInfo;
      return careerPathInfoWithSkill;
    } catch (error) {
      return error;
    }
  }
}
