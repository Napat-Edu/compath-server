import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CareerPathDataDto } from "src/dtos/career-path-data.dto";
import { ResumeHistoryDto } from "src/dtos/resume-input.dto";
import { IUserResumeInput } from "src/interfaces/career-prediction.interface";
import { ResumeHistory } from "src/schemas/resume-history.schema";

@Injectable()
export class DatabaseService {
    constructor(
        @InjectModel(ResumeHistory.name)
        private resumeHistoryModel: Model<ResumeHistory>,
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
}