import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { securityMiddleware } from './security.middleware';

loadEnv({ path: resolve(__dirname, '..', '.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const trustProxy = process.env.TRUST_PROXY?.trim();
  const frontendUrl = process.env.FRONTEND_URL?.split(',').map((value) => value.trim()).filter(Boolean);

  if (!frontendUrl || frontendUrl.length === 0) {
    throw new Error('FRONTEND_URL deve ser configurado para inicializar a API com CORS seguro');
  }

  if (trustProxy) {
    app.getHttpAdapter().getInstance().set('trust proxy', trustProxy === 'true' ? 1 : trustProxy);
  }

  app.use(securityMiddleware);

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
}

bootstrap();
