import { Module } from '@nestjs/common';
import { CareerService } from './career.service';
import { CareerController } from './career.controller';
import { HttpModule } from '@nestjs/axios';
import { CareerFactoryService } from 'src/services/career-factory.service';
import { DatabaseService } from 'src/services/database.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ResumeHistory, ResumeHistorySchema } from 'src/schemas/resume-history.schema';
import { ExternalApiService } from 'src/services/external-api.service';
import { CareerPathData, CareerPathDataSchema } from 'src/schemas/career-path-data.schema';
import { SkillData, SkillDataSchema } from 'src/schemas/skill-data.schema';
import { CareerProcessorService } from 'src/services/career-processor.service';

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
  providers: [
    CareerService,
    CareerFactoryService,
    DatabaseService,
    ExternalApiService,
    CareerProcessorService
  ],
})
export class CareerModule { }
