import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Socket } from 'net';

interface CacheEntry<T = any> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly memoryCache = new Map<string, CacheEntry>();
  private redisSocket: Socket | null = null;
  private isRedisConnected = false;
  private readonly redisUrl: string | null;

  constructor() {
    this.redisUrl =
      process.env.REDIS_URL?.trim() ||
      (process.env.REDIS_HOST
        ? `redis://${process.env.REDIS_HOST.trim()}:${process.env.REDIS_PORT?.trim() || '6379'}`
        : null);

    if (this.redisUrl) {
      this.initRedisConnection();
    } else {
      this.logger.log('CacheService initialized in memory mode (REDIS_URL not set).');
    }
  }

  onModuleDestroy() {
    if (this.redisSocket) {
      this.redisSocket.destroy();
      this.redisSocket = null;
    }
  }

  private initRedisConnection() {
    try {
      const parsed = new URL(this.redisUrl!);
      const host = parsed.hostname || 'localhost';
      const port = Number(parsed.port) || 6379;

      this.redisSocket = new Socket();
      this.redisSocket.setTimeout(3000);

      this.redisSocket.connect(port, host, () => {
        this.isRedisConnected = true;
        this.logger.log(`Connected to Redis at ${host}:${port}`);
      });

      this.redisSocket.on('error', (err) => {
        this.isRedisConnected = false;
        this.logger.warn(`Redis connection error (${err.message}). Falling back to memory cache.`);
      });

      this.redisSocket.on('close', () => {
        this.isRedisConnected = false;
      });
    } catch (err: any) {
      this.logger.warn(`Failed to parse REDIS_URL (${err.message}). Using memory cache.`);
    }
  }

  /**
   * Get a cached value by key.
   */
  async get<T>(key: string): Promise<T | null> {
    const now = Date.now();
    const entry = this.memoryCache.get(key);
    if (entry) {
      if (entry.expiresAt > now) {
        return entry.value as T;
      }
      this.memoryCache.delete(key);
    }
    return null;
  }

  /**
   * Set a cached value with a TTL in seconds (default 60s).
   */
  async set<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.memoryCache.set(key, { value, expiresAt });

    // Periodically clean up expired keys if memory cache grows
    if (this.memoryCache.size > 1000) {
      this.cleanupExpiredMemoryKeys();
    }
  }

  /**
   * Delete a specific cache key.
   */
  async del(key: string): Promise<void> {
    this.memoryCache.delete(key);
  }

  /**
   * Delete all cache keys matching a prefix.
   */
  async delByPrefix(prefix: string): Promise<void> {
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    }
  }

  private cleanupExpiredMemoryKeys() {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiresAt <= now) {
        this.memoryCache.delete(key);
      }
    }
  }
}
