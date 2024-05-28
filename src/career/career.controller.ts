import { Body, Controller, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CareerService } from './career.service';
import { IUserResumeInput } from 'src/interfaces/career-prediction.interface';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('/career')
export class CareerController {
  constructor(
    private readonly careerService: CareerService
  ) { }

  @Post('resume/text')
  createResumeHistory(@Body() resume: IUserResumeInput) {
    try {
      return this.careerService.createResumeHistory(resume);
    } catch (error) {
      return error;
    }
  }

  @Post('resume/file')
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
    @Body('owner') owner: string,
  ) {
    try {
      return this.careerService.createResumeHistoryByPDF(
        file,
        owner,
      );
    } catch (error) {
      return error;
    }
  }
}
