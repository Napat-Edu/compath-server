import { Controller, Get } from '@nestjs/common';
import { CareerExplorationService } from './career-exploration.service';

@Controller('/career-exploration')
export class CareerExplorationController {
  constructor(
    private readonly careerExplorationService: CareerExplorationService,
  ) {}

  @Get()
  getCareerExplorationData() {
    try {
      return this.careerExplorationService.getCareerExplorationData();
    } catch (err) {
      return err;
    }
  }
}
