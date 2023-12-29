import { Injectable } from '@nestjs/common';

@Injectable()
export class CareerPredictionService {
  getCareerPredictionResult() {
    return { msg: 'Software Engineer' };
  }
}
