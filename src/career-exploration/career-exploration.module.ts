import { Module } from '@nestjs/common';
import { CareerExplorationController } from './career-exploration.controller';
import { CareerExplorationService as CareerExplorationService } from './career-exploration.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CareerPathData,
  CareerPathDataSchema,
} from 'src/schemas/career-path-data.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CareerPathData.name, schema: CareerPathDataSchema },
    ]),
  ],
  controllers: [CareerExplorationController],
  providers: [CareerExplorationService],
})
export class CareerExplorationModule {}
