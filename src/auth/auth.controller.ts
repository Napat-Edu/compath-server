import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  handleLogin() {
    return { msg: 'google login' };
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
