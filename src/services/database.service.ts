import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CareerPathDataDto } from "src/dtos/career-path-data.dto";
import { CareerPathData } from "src/schemas/career-path-data.schema";
import { ResumeHistory } from "src/schemas/resume-history.schema";

@Injectable()
export class DatabaseService {
    constructor(
        @InjectModel(CareerPathData.name)
        private careerPathDataModel: Model<CareerPathData>,
        @InjectModel(ResumeHistory.name)
        private resumeHistoryModel: Model<ResumeHistory>,
    ) { }

    async findCareerPath(careerPath: string) {
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
}