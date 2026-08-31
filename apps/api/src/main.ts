import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import { existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { assertProductionConfig, isStrictEnv } from './common/env';

const logger = new Logger('Bootstrap');

// Ensure BigInt can be cleanly serialized to JSON in Express responses.
// @ts-expect-error BigInt prototype extension for JSON.stringify
BigInt.prototype.toJSON = function () {
  return this.toString();
};

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
      // Strip unrecognized fields silently rather than rejecting with 400.
      // This allows frontend to evolve ahead of backend deploys.
      forbidNonWhitelisted: false,
    }),
  );

  // Correlate client reports with server logs. Do not log query strings or
  // bodies because they can contain personal or health-related information.
  app.use((req: Request, res: Response, next: NextFunction) => {
    const suppliedRequestId = req.headers['x-request-id'];
    const requestId =
      typeof suppliedRequestId === 'string' && /^[a-zA-Z0-9_-]{8,128}$/.test(suppliedRequestId)
        ? suppliedRequestId
        : randomUUID();
    const startedAt = Date.now();
    res.setHeader('X-Request-Id', requestId);
    res.on('finish', () => {
      const durationMs = Date.now() - startedAt;
      const context = `${req.method} ${req.path} ${res.statusCode} ${durationMs}ms requestId=${requestId}`;
      if (res.statusCode >= 500) logger.error(context);
      else if (durationMs >= 2_000) logger.warn(`Slow request: ${context}`);
    });
    next();
  });

  // CORS: manually reflect the matching origin — no cors package involved.
  const corsAllowed = new Set(
    (process.env.CORS_ORIGIN?.trim() ?? '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  );

  const isOriginAllowed = (origin: string): boolean => {
    if (corsAllowed.has(origin)) return true;

    try {
      const url = new URL(origin);
      const hostname = url.hostname;

      // In dev / non-strict env, allow any local host or LAN origin on any port
      if (!isStrictEnv()) {
        if (
          hostname === 'localhost' ||
          hostname === '127.0.0.1' ||
          /^192\.168\.\d+\.\d+$/.test(hostname) ||
          /^10\.\d+\.\d+\.\d+$/.test(hostname) ||
          /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(hostname)
        ) {
          return true;
        }
      }

      // Automatically allow both apex and www if either is in the configured allowlist
      for (const allowed of corsAllowed) {
        try {
          const allowedUrl = new URL(allowed);
          const allowedHost = allowedUrl.hostname;
          if (hostname === allowedHost) return true;
          if (allowedHost.replace(/^www\./, '') === hostname.replace(/^www\./, '')) {
            return true;
          }
        } catch {
          // ignore invalid URLs in set
        }
      }

      // Allow any subdomains or apex domain of ayurpass.com
      if (hostname === 'ayurpass.com' || hostname.endsWith('.ayurpass.com')) {
        return true;
      }

      // Allow any AWS Amplify branch preview/hosting URLs
      if (hostname.endsWith('.amplifyapp.com')) {
        return true;
      }
    } catch {
      // ignore invalid origin header format
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

  // Serve uploaded media files. Static prefix avoids collision with POST /uploads route.
  const uploadDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
  app.useStaticAssets(uploadDir, {
    prefix: '/files/',
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

  const port = Number(process.env.PORT) || 4000;
  await app.listen(port, '0.0.0.0');
  logger.log(`AyurPass Backend running on port ${port}`);
  logger.log(`Uploads served from ${uploadDir} at /files/`);
}
bootstrap();
