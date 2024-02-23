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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResumeHistory.name, schema: ResumeHistorySchema },
      { name: CareerPathData.name, schema: CareerPathDataSchema },
    ]),
  ],
  controllers: [CareerInsightController],
  providers: [CareerInsightService],
})
export class CareerInsightModule {}
