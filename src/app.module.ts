import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

const ENV_MODULE = ConfigModule.forRoot({
  isGlobal: true,
});

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CareerPredictionModule } from './career-prediction/career-prediction.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CareerInsightModule } from './career-insight/career-insight.module';
import { CareerExplorationModule } from './career-exploration/career-exploration.module';
import {
  ResumeHistory,
  ResumeHistorySchema,
} from './schemas/resume-history.schema';

@Module({
  imports: [
    ENV_MODULE,
    MongooseModule.forRoot(process.env.MONGODB_URL, {
      dbName: process.env.DB_NAME,
    }),
    MongooseModule.forFeature([
      { name: ResumeHistory.name, schema: ResumeHistorySchema },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CareerPredictionModule,
    CareerInsightModule,
    CareerExplorationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
