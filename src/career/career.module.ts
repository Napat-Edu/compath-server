import { Module } from '@nestjs/common';
import { CareerService } from './career.service';
import { CareerController } from './career.controller';
import { HttpModule } from '@nestjs/axios';
import { CareerFactoryService } from 'src/services/career-factory.service';
import { DatabaseService } from 'src/services/database.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ResumeHistory, ResumeHistorySchema } from 'src/schemas/resume-history.schema';
import { ExternalApiService } from 'src/services/external-api.service';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: ResumeHistory.name, schema: ResumeHistorySchema },
    ]),
  ],
  controllers: [CareerController],
  providers: [
    CareerService,
    CareerFactoryService,
    DatabaseService,
    ExternalApiService
  ],
})
export class CareerModule { }
