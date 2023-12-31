import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.BASE_CLIENT,
    methods: ['GET', 'POST'],
    credentials: true,
  });
  await app.listen(80);
}
bootstrap();
