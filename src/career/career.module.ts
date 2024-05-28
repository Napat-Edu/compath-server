import { Module } from '@nestjs/common';
import { CareerService } from './career.service';
import { CareerController } from './career.controller';

@Module({
  imports: [],
  controllers: [CareerController],
  providers: [CareerService],
})
export class CareerModule {}
