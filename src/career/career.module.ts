import { Module } from '@nestjs/common';
import { CareerController } from './career.controller';
import { CareerService } from './career.service';
import { HttpModule } from '@nestjs/axios';
import { AppService, DatabaseService } from 'src/app.service';

@Module({
  imports: [HttpModule],
  controllers: [CareerController],
  providers: [CareerService, AppService, DatabaseService],
})
export class CareerModule {}
