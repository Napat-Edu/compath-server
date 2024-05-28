import { Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, ParseFilePipe, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CareerService } from './career.service';
import { IUserResumeInput } from 'src/interfaces/career-prediction.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { ICareerInsightRequest } from 'src/interfaces/career-insight.interface';

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

  @Get('history')
  getResumeHistory(@Query() query: { email: string }) {
    try {
      return this.careerService.getResumeHistory(query.email);
    } catch (error) {
      return error;
    }
  }

  @Delete('history')
  deleteResumeHistory(@Query() query: { id: string }) {
    try {
      return this.careerService.deleteResumeHistory(query.id);
    } catch (error) {
      return error;
    }
  }

  @Get()
  getCareerData(@Query() query: ICareerInsightRequest) {
    try {
      if (query.career_path && query.object_id) {
        return this.careerService.GetCareerData(
          query.career_path,
          query.object_id,
        );
      } else {
        return this.careerService.GetAllCareerData();
      }
    } catch (error) {
      return error;
    }
  }
}
