import { Module } from '@nestjs/common';
import { CareerPredictionController } from './career-prediction.controller';
import { CareerPredictionService } from './career-prediction.service';

@Module({
  controllers: [CareerPredictionController],
  providers: [CareerPredictionService],
})
export class CareerPredictionModule {}
