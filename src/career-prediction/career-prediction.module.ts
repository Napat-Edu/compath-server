import { Module } from '@nestjs/common';
import { CareerPredictionController } from './career-prediction.controller';
import { CareerPredictionService } from './career-prediction.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ResumeHistory,
  ResumeHistorySchema,
} from 'src/schemas/resume-history.schema';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResumeHistory.name, schema: ResumeHistorySchema },
    ]),
    HttpModule,
  ],
  controllers: [CareerPredictionController],
  providers: [CareerPredictionService],
})
export class CareerPredictionModule {}
