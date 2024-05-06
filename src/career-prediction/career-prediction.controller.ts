import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CareerPredictionService } from './career-prediction.service';
import { IUserResumeInput } from 'src/interfaces/career-prediction.interface';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('/career-prediction')
export class CareerPredictionController {
  constructor(
    private readonly careerPredictionService: CareerPredictionService,
  ) {}

  @Post()
  createCareerPrediction(@Body() userResumeInput: IUserResumeInput) {
    try {
      return this.careerPredictionService.createCareerPrediction(
        userResumeInput,
      );
    } catch (err) {
      return err;
    }
  }

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  createCareerPredictionByPDF(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000000 }),
          new FileTypeValidator({ fileType: 'pdf' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      return this.careerPredictionService.createCareerPredictionByPDF(file);
    } catch (error) {
      return error;
    }
  }
}
