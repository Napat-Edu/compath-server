import { Module } from '@nestjs/common';
import { CareerPredictionController } from './career-prediction.controller';
import { CareerPredictionService } from './career-prediction.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ResumeHistory,
  ResumeHistorySchema,
} from 'src/schemas/resume-history.schema';
import { HttpModule } from '@nestjs/axios';
import {
  CareerPathData,
  CareerPathDataSchema,
} from 'src/schemas/career-path-data.schema';
import { AppService } from 'src/app.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResumeHistory.name, schema: ResumeHistorySchema },
      { name: CareerPathData.name, schema: CareerPathDataSchema },
    ]),
    HttpModule,
  ],
  controllers: [CareerPredictionController],
  providers: [CareerPredictionService, AppService],
})
export class CareerPredictionModule {}
