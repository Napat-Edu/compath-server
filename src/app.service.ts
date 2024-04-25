import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ResumeHistory } from './schemas/resume-history.schema';
import { Model } from 'mongoose';
import { CareerPathData } from './schemas/career-path-data.schema';
import { SkillData } from './schemas/skill-data.schema';
import { CareerPathDataDto } from './dtos/career-path-data.dto';
import { ResumeHistoryDto } from './dtos/resume-input.dto';
import { IUserResumeInfo } from './interfaces/career-prediction.interface';
import { SkillDataDto } from './dtos/skill-data.dto';
import { ICareerPathWithSkill } from './interfaces/career-insight.interface';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(ResumeHistory.name)
    private resumeHistoryModel: Model<ResumeHistory>,
  ) {}

  getHello(): string {
    return `This is ${process.env.MODE} mode`;
  }

  async countCareermate(careerPath: string): Promise<number> {
    try {
      const careermate_count = await this.resumeHistoryModel
        .countDocuments({
          prediction_result: careerPath,
          $and: [
            { 'resume_input.skill': { $nin: ['-', '.'] } },
            { 'resume_input.experience': { $nin: ['-', '.'] } },
          ],
        })
        .exec();
      return careermate_count;
    } catch (err) {
      return err;
    }
  }
}

@Injectable()
export class DatabaseService {
  constructor(
    @InjectModel(ResumeHistory.name)
    private resumeHistoryModel: Model<ResumeHistory>,
    @InjectModel(CareerPathData.name)
    private careerPathDataModel: Model<CareerPathData>,
    @InjectModel(SkillData.name)
    private skillDataModel: Model<SkillData>,
  ) {}

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

  async createNewHistory(
    owner: string,
    resume: IUserResumeInfo,
    careerPath: string,
  ) {
    try {
      const newResumeHistory: ResumeHistoryDto = {
        resume_owner: owner,
        resume_input: resume,
        input_date: new Date(),
        prediction_result: careerPath,
      };
      const newHistoryModel = new this.resumeHistoryModel(newResumeHistory);
      const createdHistory = await newHistoryModel.save();
      return createdHistory;
    } catch (err) {
      return err;
    }
  }

  async getPredictionHistoriesByEmail(email: string) {
    const histories = await this.resumeHistoryModel
      .find({
        resume_owner: email,
      })
      .exec();
    return histories;
  }

  async getPredictionHistoryById(objectId: string) {
    const history = await this.resumeHistoryModel.findById(objectId).exec();
    return history;
  }

  async deletePredictionHistoryById(id: string) {
    const result = await this.resumeHistoryModel.deleteOne({ _id: id });
    if (result.acknowledged) {
      return { msg: 'delete successful' };
    } else {
      return { msg: 'error occured' };
    }
  }

  async getAllSkillData() {
    const skillDatas: SkillDataDto[] = await this.skillDataModel.find().exec();
    return skillDatas;
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

    return careerPathData;
  }
}
