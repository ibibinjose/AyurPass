import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { assertProductionConfig, isStrictEnv } from './common/env';

async function bootstrap() {
  assertProductionConfig();

  // Explicitly disable NestJS built-in CORS — we handle it manually below.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    cors: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS: manually reflect the matching origin — no cors package involved.
  const corsAllowed = new Set(
    (process.env.CORS_ORIGIN?.trim() ?? '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  );

  const isOriginAllowed = (origin: string): boolean => {
    if (corsAllowed.has(origin)) return true;

    // In dev / non-strict env, allow any local host origin on any port
    if (!isStrictEnv()) {
      return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    }

    return false;
  };

  // Register on the raw Express app BEFORE NestJS routes are mounted.
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin as string | undefined;
    if (origin && isOriginAllowed(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin');
    }
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
      res.setHeader('Access-Control-Max-Age', '86400');
      res.status(204).end();
      return;
    }
    next();
  });

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

  // Security headers
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
