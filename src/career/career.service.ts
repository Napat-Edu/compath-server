import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosError } from 'axios';
import { Model } from 'mongoose';
import { catchError, firstValueFrom } from 'rxjs';
import { AppService, DatabaseService } from 'src/app.service';
import { SkillDataDto } from 'src/dtos/skill-data.dto';
import {
  ICareerPathClassify,
  ICareerPathWithSkill,
  ISkillType,
} from 'src/interfaces/career-insight.interface';
import {
  IResumePredictionResult,
  IUserResumeInfo,
  IUserResumeInput,
} from 'src/interfaces/career-prediction.interface';
import { CareerPathData } from 'src/schemas/career-path-data.schema';
import { ResumeHistory } from 'src/schemas/resume-history.schema';
import { SkillData } from 'src/schemas/skill-data.schema';

@Injectable()
export class CareerService {
  private readonly logger = new Logger();

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(ResumeHistory.name)
    private resumeHistoryModel: Model<ResumeHistory>,
    @InjectModel(CareerPathData.name)
    private careerPathDataModel: Model<CareerPathData>,
    @InjectModel(SkillData.name)
    private skillDataModel: Model<SkillData>,
    private appService: AppService,
    private databaseService: DatabaseService,
  ) {}

  async createCareerPrediction(userResumeInput: IUserResumeInput) {
    const careerPath = await this.classificationCareerPath(userResumeInput.resume_input);
    const careerPathInfo = await this.databaseService.getCareerPathInfo(careerPath);
    const createdHistory = await this.databaseService.createNewHistory(
      userResumeInput.resume_owner, 
      userResumeInput.resume_input, 
      careerPathInfo.career_path_name
    );
    const careermate_count = await this.appService.countCareermate(careerPath);
    
    const result: IResumePredictionResult = {
      ...careerPathInfo,
      input_date: createdHistory.input_date,
      object_id: createdHistory._id,
      careermate_count: careermate_count,
    };
    return result;
  }

  async classificationCareerPath(resume: IUserResumeInfo) {
    const predictionResult = await firstValueFrom(
      this.httpService.post(process.env.MODEL_API, resume).pipe(
        catchError((err: AxiosError) => {
          this.logger.error(err.response.data);
          throw 'error occured';
        }),
      ),
    );
    return predictionResult.data;
  }

  async getPredictionHistory(email: string) {
    const histories = await this.databaseService.getPredictionHistoriesByEmail(email);
    return histories;
  }

  async deletePredictionHistory(id: string) {
    const result = await this.databaseService.deletePredictionHistoryById(id);
    return result;
  }

  async getCareerInsight(careerPath: string, objectId: string) {
    try {
      const skillDatas: SkillDataDto[] = await this.databaseService.getAllSkillData();
      const careerPathData: ICareerPathWithSkill = await this.databaseService.getCareerPathDataWithSkill(careerPath);
      const userResumeHistory = await this.databaseService.getPredictionHistoryById(objectId);

      const userResume = userResumeHistory.resume_input;
      const careermate_count = await this.appService.countCareermate(careerPath);

      const mappedRelatedCareer = careerPathData.related_careers.map(
        (career) => {
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
            alt_skills: this.classifyAlternativeSkill(
              skillDatas,
              userResume.skill,
            ),
          };
        },
      );

      const classifiedInsightData: ICareerPathClassify = {
        ...careerPathData,
        related_careers: mappedRelatedCareer,
        careermate_count: careermate_count,
      };

      const uniqueInsightData = this.removeDuplicateSkill(
        classifiedInsightData,
      );
      const sortedInsightData = {
        ...uniqueInsightData,
        related_careers: uniqueInsightData.related_careers.sort((a, b) =>
          a.career.localeCompare(b.career),
        ),
      };

      return sortedInsightData;
    } catch (error) {
      return { msg: "can't find this specific object, invalid object_id" };
    }
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

  async getExplorationData() {
    const careerPathData = await this.databaseService.getAllCareerData();
    const sortedCareerPathData = this.sortCareerData(careerPathData);
    return sortedCareerPathData;
  }

  sortCareerData(careerPathData) {
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
}
