import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { AuthService } from './auth.service';
import { SessionSerializer } from './serializer/Serializer';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [
    GoogleStrategy,
    SessionSerializer,
    {
      provide: 'AUTH_SERVICE',
      useClass: AuthService,
    },
  ],
})
export class AuthModule {}
