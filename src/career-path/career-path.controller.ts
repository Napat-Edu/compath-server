import { Controller, Get } from '@nestjs/common';
import { CareerPathService } from './career-path.service';

@Controller('/career-path')
export class CareerPathController {
  constructor(private readonly careerPathService: CareerPathService) {}

  @Get()
  getCareerPathData() {
    try {
      return this.careerPathService.getCareerPathData();
    } catch (err) {
      return err;
    }
  }
}
