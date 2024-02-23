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

@Module({
  imports: [
    ENV_MODULE,
    MongooseModule.forRoot(process.env.MONGODB_URL, {
      dbName: process.env.DB_NAME,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CareerPredictionModule,
    CareerInsightModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
