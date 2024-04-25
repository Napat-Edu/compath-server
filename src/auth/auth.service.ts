import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosError } from 'axios';
import { Model } from 'mongoose';
import { catchError, firstValueFrom } from 'rxjs';
import { UserDto } from 'src/dtos/user.dto';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger();

  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly httpService: HttpService,
  ) {}

  async exchangeToken(code: string) {
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
  }

  async login(details: UserDto) {
    const user = await this.userModel.findOne({ email: details.email });
    if (user) {
      return user;
    } else {
      const newUser = new this.userModel(details);
      return newUser.save();
    }
  }
}
