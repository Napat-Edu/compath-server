import { Module } from '@nestjs/common';
import { CareerInsightService } from './career-insight.service';
import { CareerInsightController } from './career-insight.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CareerPathData,
  CareerPathDataSchema,
} from 'src/schemas/career-path-data.schema';
import {
  ResumeHistory,
  ResumeHistorySchema,
} from 'src/schemas/resume-history.schema';
import { SkillData, SkillDataSchema } from 'src/schemas/skill-data.schema';
import { AppService } from 'src/app.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResumeHistory.name, schema: ResumeHistorySchema },
      { name: CareerPathData.name, schema: CareerPathDataSchema },
      { name: SkillData.name, schema: SkillDataSchema },
    ]),
  ],
  controllers: [CareerInsightController],
  providers: [CareerInsightService, AppService],
})
export class CareerInsightModule {}
