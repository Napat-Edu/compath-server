import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CareerPredictionModule } from './career-prediction/career-prediction.module';

@Module({
  imports: [CareerPredictionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
