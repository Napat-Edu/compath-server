import { Module } from '@nestjs/common';
import { CareerInsightController } from './career-insight.controller';
import { CareerInsightService } from './career-insight.service';

@Module({
  imports: [],
  controllers: [CareerInsightController],
  providers: [CareerInsightService],
})
export class CareerInsightModule {}
