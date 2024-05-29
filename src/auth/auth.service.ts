import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { UserDto } from 'src/dtos/user.dto';
import { DatabaseService } from 'src/services/database.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger();

  constructor(
    private readonly httpService: HttpService,
    private readonly databaseService: DatabaseService,
  ) { }

  async exchangeToken(code: string) {
    try {
      const client_id = process.env.CLIENT_ID;
      const client_secret = process.env.CLIENT_SECRET;
      const redirect_uri = process.env.BASE_CLIENT;
      const grant_type = 'authorization_code';

      const bodyParams = new URLSearchParams({
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type,
      });

      const token = await firstValueFrom(
        this.httpService
          .post('https://oauth2.googleapis.com/token', bodyParams)
          .pipe(
            catchError((err: AxiosError) => {
              this.logger.error(err.response.data);
              throw 'error occured';
            }),
          ),
      );

      return token.data;
    } catch (error) {
      return error;
    }
  }

  async login(details: UserDto) {
    try {
      const user = await this.databaseService.findUserById(details.email);
      if (user) {
        return user;
      } else {
        return await this.databaseService.createNewUser(details);
      }
    } catch (error) {
      return error;
    }
  }
}
