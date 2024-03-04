import { Module } from '@nestjs/common';
import { CareerPathController } from './career-path.controller';
import { CareerPathService } from './career-path.service';
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
  controllers: [CareerPathController],
  providers: [CareerPathService],
})
export class CareerPathModule {}
