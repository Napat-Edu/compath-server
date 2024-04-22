import { Module } from '@nestjs/common';
import { CareerController } from './career.controller';
import { CareerService } from './career.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ResumeHistory,
  ResumeHistorySchema,
} from 'src/schemas/resume-history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResumeHistory.name, schema: ResumeHistorySchema },
    ]),
  ],
  controllers: [CareerController],
  providers: [CareerService],
})
export class CareerModule {}
