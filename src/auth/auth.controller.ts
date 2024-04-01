import { Controller, Get, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google.guard';

@Controller('auth')
export class AuthController {
  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  handleLogin() {
    return { msg: 'google login' };
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  handleRedirect() {
    return { msg: 'google redirect' };
  }
}
