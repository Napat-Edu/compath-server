import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CareerPredictionModule } from './career-prediction/career-prediction.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb+srv://compath-db-admin:${process.env.MONGODB_PASSWORD}@compath-cluster.q6e2eff.mongodb.net/?retryWrites=true&w=majority`,
    ),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CareerPredictionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
