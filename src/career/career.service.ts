import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosError } from 'axios';
import { Model } from 'mongoose';
import { catchError, firstValueFrom } from 'rxjs';
import { AppService } from 'src/app.service';
import { CareerPathDataDto } from 'src/dtos/career-path-data.dto';
import { ResumeHistoryDto } from 'src/dtos/resume-input.dto';
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
  ) {}

  async createCareerPrediction(userResumeInput: IUserResumeInput) {
    const careerPath = await this.classificationCareerPath(
      userResumeInput.resume_input,
    );
    const careerPathInfo = await this.getCareerPathInfo(careerPath);
    const newHistory: ResumeHistoryDto = {
      resume_owner: userResumeInput.resume_owner,
      resume_input: userResumeInput.resume_input,
      input_date: new Date(),
      prediction_result: careerPathInfo.career_path_name,
    };
    const createdHistory: ResumeHistoryDto =
      await this.createNewHistory(newHistory);
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

  async getCareerPathInfo(careerPath: string) {
    try {
      let careerPathInfo: CareerPathDataDto = await this.careerPathDataModel
        .findOne({
          career_path_name: careerPath,
        })
        .exec();

      if (!careerPathInfo) {
        careerPathInfo = await this.careerPathDataModel
          .findOne({
            career_path_name: 'Unknown',
          })
          .exec();
      }
      const jsonCareerPathInfo = JSON.stringify(careerPathInfo);
      const parsedCareerPathInfo = JSON.parse(jsonCareerPathInfo);
      return parsedCareerPathInfo;
    } catch (err) {
      return err;
    }
  }

  async createNewHistory(newResumeHistory: ResumeHistoryDto) {
    try {
      const newHistoryModel = new this.resumeHistoryModel(newResumeHistory);
      const createdHistory = await newHistoryModel.save();
      return createdHistory;
    } catch (err) {
      return err;
    }
  }

  async getPredictionHistory(email: string) {
    const histories = await this.resumeHistoryModel
      .find({
        resume_owner: email,
      })
      .exec();
    return histories;
  }

  async deletePredictionHistory(id: string) {
    const result = await this.resumeHistoryModel.deleteOne({ _id: id });
    if (result.acknowledged) {
      return { msg: 'delete successful' };
    } else {
      return { msg: 'error occured' };
    }
  }

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

  async getAllCareerData() {
    const careerPathData = await this.careerPathDataModel.aggregate([
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
        $lookup: {
          from: 'skilldatas',
          localField: 'related_careers.soft_skills',
          foreignField: 'id',
          as: 'career_soft_skills',
        },
      },
      {
        $unwind: '$career_soft_skills',
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
            $addToSet: {
              id: '$career_domains.id',
              name: '$career_domains.name',
              skill_list: '$skill_data.name',
              is_in_resume: '$career_domains.is_in_resume',
            },
          },
          soft_skills: {
            $addToSet: {
              id: '$career_soft_skills.id',
              name: '$career_soft_skills.name',
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
              soft_skills: '$soft_skills',
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
    ]);

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
