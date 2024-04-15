import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google.guard';
import { Request } from 'express';
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
  // @UseGuards(GoogleAuthGuard)
  async handleLogin(@Body('token') token: string) {
    const ticket = await client.verifyIdToken({
      idToken: token,
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

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  handleRedirect(@Req() request: Request) {
    return request.user;
  }

  @Get('status')
  user(@Req() request: Request) {
    return request.user
      ? { msg: 'Authenticated' }
      : { msg: 'Not Authenticated' };
  }
}
