import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
// import { GoogleAuthGuard } from './guards/google.guard';
// import { Request } from 'express';
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
  async handleLogin(@Body('code') code: string) {
    const client_id = process.env.CLIENT_ID;
    const client_secret = process.env.CLIENT_SECRET;
    const redirect_uri = process.env.BASE_CLIENT;
    const grant_type = 'authorization_code';

    const credential = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type,
      }),
    })
      .then((response) => response.json())
      .catch((error) => {
        console.log(error);

        return { error: error };
      });

    const ticket = await client.verifyIdToken({
      idToken: credential.id_token,
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

  // @Get('google/redirect')
  // @UseGuards(GoogleAuthGuard)
  // handleRedirect(@Req() request: Request) {
  //   return request.user;
  // }

  // @Get('status')
  // user(@Req() request: Request) {
  //   return request.user
  //     ? { msg: 'Authenticated' }
  //     : { msg: 'Not Authenticated' };
  // }
}
