import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

const ENV_MODULE = ConfigModule.forRoot({
  isGlobal: true,
});

import { AppController } from './app.controller';
import { AppService, DatabaseService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ResumeHistory,
  ResumeHistorySchema,
} from './schemas/resume-history.schema';
import { AuthModule } from './auth/auth.module';
import { CareerModule } from './career/career.module';
import {
  CareerPathData,
  CareerPathDataSchema,
} from './schemas/career-path-data.schema';
import { SkillData, SkillDataSchema } from './schemas/skill-data.schema';

@Module({
  imports: [
    ENV_MODULE,
    MongooseModule.forRoot(process.env.MONGODB_URL, {
      dbName: process.env.DB_NAME,
    }),
    MongooseModule.forFeature([
      { name: ResumeHistory.name, schema: ResumeHistorySchema },
      { name: CareerPathData.name, schema: CareerPathDataSchema },
      { name: SkillData.name, schema: SkillDataSchema },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    CareerModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
  exports: [AppService, DatabaseService],
})
export class AppModule {}
