import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { AxiosError } from "axios";
import { ocrSpace } from "ocr-space-api-wrapper";
import { catchError, firstValueFrom } from "rxjs";
import { IUserResumeInfo } from "src/interfaces/career-prediction.interface";

@Injectable()
export class ExternalApiService {
    private readonly logger = new Logger();

    constructor(
        private readonly httpService: HttpService,
    ) { }

    async ocrResume(buffer: string) {
        try {
            const parsedResume = await ocrSpace(
                `data:application/pdf;base64,${buffer}`,
                {
                    apiKey: process.env.OCR_API_KEY,
                    language: 'eng',
                },
            );
            return parsedResume.ParsedResults[0].ParsedText;
        } catch (error) {
            return error;
        }
    }

    async classificationCareerpath(resumeInfo: IUserResumeInfo) {
        try {
            const predictionResult = await firstValueFrom(
                this.httpService.post(process.env.MODEL_API, resumeInfo).pipe(
                    catchError((err: AxiosError) => {
                        this.logger.error(err.response.data);
                        throw 'error occured';
                    }),
                ),
            );
            return predictionResult.data;
        } catch (error) {
            return error;
        }
    }
}