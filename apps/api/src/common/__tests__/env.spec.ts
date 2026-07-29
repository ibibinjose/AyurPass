import { isProduction, isStrictEnv, accessSecret, refreshSecret, assertProductionConfig, corsOrigins } from '../env';

describe('env helpers', () => {
  const originalEnv = process.env;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env = originalEnv;
  });

  describe('isProduction', () => {
    it('should return true when NODE_ENV=production', () => {
      process.env.NODE_ENV = 'production';
      expect(isProduction()).toBe(true);
    });

    it('should return false when NODE_ENV=development', () => {
      process.env.NODE_ENV = 'development';
      expect(isProduction()).toBe(false);
    });
  });

  describe('isStrictEnv', () => {
    it('should return true in production', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.AYURPASS_STRICT;
      expect(isStrictEnv()).toBe(true);
    });

    it('should return true when AYURPASS_STRICT=1', () => {
      process.env.NODE_ENV = 'development';
      process.env.AYURPASS_STRICT = '1';
      expect(isStrictEnv()).toBe(true);
    });

    it('should return false in development without strict flag', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.AYURPASS_STRICT;
      expect(isStrictEnv()).toBe(false);
    });
  });

  describe('accessSecret', () => {
    it('should return env variable when set', () => {
      process.env.JWT_ACCESS_SECRET = 'my-secret';
      const secret = accessSecret();
      expect(secret).toBe('my-secret');
    });

    it('should throw in strict env without secret', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.JWT_ACCESS_SECRET;
      expect(() => accessSecret()).toThrow('JWT_ACCESS_SECRET is required in production');
    });

    it('should return dev fallback in non-strict env', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.JWT_ACCESS_SECRET;
      const secret = accessSecret();
      expect(secret).toBe('ayurpass_access_secret');
    });
  });

  describe('refreshSecret', () => {
    it('should return env variable when set', () => {
      process.env.JWT_REFRESH_SECRET = 'my-refresh-secret';
      const secret = refreshSecret();
      expect(secret).toBe('my-refresh-secret');
    });

    it('should throw in strict env without secret', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.JWT_REFRESH_SECRET;
      expect(() => refreshSecret()).toThrow('JWT_REFRESH_SECRET is required in production');
    });

    it('should return dev fallback in non-strict env', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.JWT_REFRESH_SECRET;
      const secret = refreshSecret();
      expect(secret).toBe('ayurpass_refresh_secret');
    });
  });

  describe('assertProductionConfig', () => {
    it('should not throw in development', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.JWT_ACCESS_SECRET;
      delete process.env.JWT_REFRESH_SECRET;
      delete process.env.DATABASE_URL;
      delete process.env.CORS_ORIGIN;

      expect(() => assertProductionConfig()).not.toThrow();
    });

    it('should throw when using dev JWT secrets in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_ACCESS_SECRET = 'ayurpass_access_secret';
      process.env.JWT_REFRESH_SECRET = 'ayurpass_refresh_secret';
      process.env.DATABASE_URL = 'postgres://real';
      process.env.CORS_ORIGIN = 'https://example.com';

      expect(() => assertProductionConfig()).toThrow('JWT_ACCESS_SECRET must not use the development default');
    });

    it('should throw when CORS_ORIGIN is wildcard in strict env', () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_ACCESS_SECRET = 'real-secret';
      process.env.JWT_REFRESH_SECRET = 'real-refresh';
      process.env.DATABASE_URL = 'postgres://real';
      process.env.CORS_ORIGIN = '*';

      expect(() => assertProductionConfig()).toThrow('CORS_ORIGIN must be an explicit allowlist');
    });

    it('should throw when required env vars are missing in production', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.JWT_ACCESS_SECRET;
      delete process.env.JWT_REFRESH_SECRET;
      delete process.env.DATABASE_URL;
      delete process.env.CORS_ORIGIN;

      expect(() => assertProductionConfig()).toThrow('Missing required environment variable(s)');
    });
  });

  describe('corsOrigins', () => {
    it('should return localhost allowlist in dev with no env', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.CORS_ORIGIN;

      const fn = corsOrigins() as (origin: string, cb: (err: Error | null, allow?: boolean) => void) => void;
      fn('http://localhost:3000', (err, allow) => {
        expect(allow).toBe(true);
      });
    });

    it('should return true for wildcard in non-strict env', () => {
      process.env.NODE_ENV = 'development';
      process.env.CORS_ORIGIN = '*';

      expect(corsOrigins()).toBe(true);
    });

    it('should parse comma-separated origins', () => {
      process.env.NODE_ENV = 'production';
      process.env.CORS_ORIGIN = 'https://app.ayurpass.com,https://dashboard.ayurpass.com';

      const fn = corsOrigins() as (origin: string, cb: (err: Error | null, allow?: boolean) => void) => void;
      fn('https://app.ayurpass.com', (err, allow) => {
        expect(allow).toBe(true);
      });
      fn('https://other.com', (err, allow) => {
        expect(allow).toBe(false);
      });
    });
  });
});