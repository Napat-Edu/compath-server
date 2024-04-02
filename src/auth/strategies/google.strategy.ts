import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: AuthService,
  ) {
    super({
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALL_BACK_URL,
      scope: ['profile', 'email', 'openid'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const user = await this.authService.validateUser(
      {
        id: profile.id,
        email: profile.emails[0].value,
        displayName: profile.displayName,
      },
      profile.photos[0].value,
    );
    const userResponse = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      picture: profile.photos[0].value,
    };
    return userResponse || null;
  }
}
