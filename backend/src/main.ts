import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { assertProductionConfig, isStrictEnv } from './common/env';
import cors from 'cors';

async function bootstrap() {
  assertProductionConfig();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS: use raw cors middleware to properly reflect origin
  const corsAllowed = new Set(
    (process.env.CORS_ORIGIN?.trim() ?? '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  );

  app.use(cors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) return callback(null, true);
      if (corsAllowed.has(requestOrigin)) return callback(null, true);
      if (!isStrictEnv()) return callback(null, true);
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  }));

  // Local image uploads (avatars, covers, gallery). Create dir if missing.
  const uploadDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
  app.useStaticAssets(uploadDir, {
    prefix: '/uploads/',
    maxAge: isStrictEnv() ? '7d' : 0,
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', isStrictEnv() ? 'public, max-age=604800' : 'no-cache');
    },
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (isStrictEnv()) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 AyurPass Backend running on port ${port}`);
  console.log(`🖼  Uploads served from ${uploadDir} at /uploads/`);
}
bootstrap();
