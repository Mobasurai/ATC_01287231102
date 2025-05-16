import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.CLIENT_URL,
    methods: 'GET,POST,PUT,DELETE,PATCH',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
