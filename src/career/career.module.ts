import { Module } from '@nestjs/common';
import { CareerController } from './career.controller';
import { CareerService } from './career.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ResumeHistory,
  ResumeHistorySchema,
} from 'src/schemas/resume-history.schema';
import { HttpModule } from '@nestjs/axios';
import { AppService, DatabaseService } from 'src/app.service';
import {
  CareerPathData,
  CareerPathDataSchema,
} from 'src/schemas/career-path-data.schema';
import { SkillData, SkillDataSchema } from 'src/schemas/skill-data.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResumeHistory.name, schema: ResumeHistorySchema },
      { name: CareerPathData.name, schema: CareerPathDataSchema },
      { name: SkillData.name, schema: SkillDataSchema },
    ]),
    HttpModule,
  ],
  controllers: [CareerController],
  providers: [CareerService, AppService, DatabaseService],
})
export class CareerModule {}
