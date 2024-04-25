import { Body, Controller, Post } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { AuthService } from './auth.service';
import { UserDto } from 'src/dtos/user.dto';

const client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
);

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google/login')
  async handleLogin(@Body('code') code: string) {
    const token = await this.authService.exchangeToken(code);
    const ticket = await client.verifyIdToken({
      idToken: token.id_token,
      audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userPayload: UserDto = {
      id: payload.sub,
      email: payload.email,
      displayName: payload.name,
    };

    const userData = await this.authService.login(userPayload);
    const response = {
      id: userData.id,
      email: userData.email,
      displayName: userData.displayName,
      picture: payload.picture,
    };
    return response;
  }
}
