import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

const ENV_MODULE = ConfigModule.forRoot({
  isGlobal: true,
});

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CareerModule } from './career/career.module';

@Module({
  imports: [
    ENV_MODULE,
    MongooseModule.forRoot(process.env.MONGODB_URL, {
      dbName: process.env.DB_NAME,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CareerModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
