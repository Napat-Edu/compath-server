import { Module } from '@nestjs/common';
import { CareerController } from './career.controller';
import { CareerService } from './career.service';
import { HttpModule } from '@nestjs/axios';
import { DatabaseService, ResumeService } from 'src/app.service';
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

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: ResumeHistory.name, schema: ResumeHistorySchema },
      { name: CareerPathData.name, schema: CareerPathDataSchema },
      { name: SkillData.name, schema: SkillDataSchema },
    ]),
  ],
  controllers: [CareerController],
  providers: [CareerService, DatabaseService, ResumeService],
})
export class CareerModule {}
