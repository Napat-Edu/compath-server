import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { AxiosError } from "axios";
import { ocrSpace } from "ocr-space-api-wrapper";
import { catchError, firstValueFrom } from "rxjs";
import { IUserResumeInfo } from "src/interfaces/career-prediction.interface";

interface ExternalApi {
    call(payload: any): Promise<any>;
}

@Injectable()
export class OcrService implements ExternalApi {

    constructor() { }

    async call(buffer: string) {
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
}

@Injectable()
export class MLService implements ExternalApi {
    private readonly logger = new Logger();

    constructor(
        private readonly httpService: HttpService,
    ) { }

    async call(resumeInfo: IUserResumeInfo) {
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