import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CareerPathDataDto } from "src/dtos/career-path-data.dto";
import { ResumeHistoryDto } from "src/dtos/resume-input.dto";
import { SkillDataDto } from "src/dtos/skill-data.dto";
import { ICareerPathWithSkill } from "src/interfaces/career-insight.interface";
import { IUserResumeInput } from "src/interfaces/career-prediction.interface";
import { CareerPathData } from "src/schemas/career-path-data.schema";
import { ResumeHistory } from "src/schemas/resume-history.schema";
import { SkillData } from "src/schemas/skill-data.schema";

@Injectable()
export class DatabaseService {
    constructor(
        @InjectModel(ResumeHistory.name)
        private resumeHistoryModel: Model<ResumeHistory>,
        @InjectModel(CareerPathData.name)
        private careerPathDataModel: Model<CareerPathData>,
        @InjectModel(SkillData.name)
        private skillDataModel: Model<SkillData>,
    ) { }

    createNewResumeHistory(resume: IUserResumeInput, careerPathInfo: CareerPathDataDto) {
        try {
            const newResumeHistory: ResumeHistoryDto = {
                resume_owner: resume.resume_owner,
                resume_input: resume.resume_input,
                input_date: new Date(),
                prediction_result: careerPathInfo.career_path_name,
            };
            const createdResumeHistory = new this.resumeHistoryModel(newResumeHistory);
            return createdResumeHistory.save();
        } catch (error) {
            return error;
        }
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
        } catch (error) {
            return error;
        }
    }

    async getAllSkillData() {
        try {
            const skillDatas: SkillDataDto[] = await this.skillDataModel.find().exec();
            return skillDatas;
        } catch (error) {
            return error;
        }
    }

    async findResumeHistoryByEmail(email: string) {
        try {
            const histories = await this.resumeHistoryModel
                .find({
                    resume_owner: email,
                })
                .exec();
            return histories;
        } catch (error) {
            return error;
        }
    }

    async findResumeHistoryById(objectId: string) {
        try {
            const userResumeHistory = await this.resumeHistoryModel
                .findById(objectId)
                .exec();
            return userResumeHistory;
        } catch (error) {
            return error;
        }
    }

    async deleteResumeHistoryById(id: string) {
        try {
            const result = await this.resumeHistoryModel.deleteOne({ _id: id });
            if (result.acknowledged) {
                return { msg: 'delete successful' };
            } else {
                return { msg: 'error occured' };
            }
        } catch (error) {
            return error;
        }
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
        try {
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
        } catch (error) {
            return error;
        }
    }
}