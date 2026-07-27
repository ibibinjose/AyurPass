import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { init, track, identify, Identify, flush } from '@amplitude/analytics-node';

@Injectable()
export class AmplitudeService implements OnApplicationShutdown {
  private readonly logger = new Logger(AmplitudeService.name);
  private readonly enabled: boolean;

  constructor() {
    const apiKey = process.env.AMPLITUDE_API_KEY;
    if (!apiKey) {
      this.logger.warn('AMPLITUDE_API_KEY not set — analytics disabled');
      this.enabled = false;
      return;
    }
    init(apiKey);
    this.enabled = true;
    this.logger.log('Amplitude analytics initialized');
  }

  track(userId: string, eventName: string, properties: Record<string, unknown> = {}): void {
    if (!this.enabled) return;
    track(eventName, properties, { user_id: userId });
  }

  identifyUser(userId: string, properties: Record<string, unknown>): void {
    if (!this.enabled) return;
    const identifyEvent = new Identify();
    for (const [key, value] of Object.entries(properties)) {
      identifyEvent.set(key, value as string | number | boolean | string[]);
    }
    identify(identifyEvent, { user_id: userId });
  }

  async onApplicationShutdown(): Promise<void> {
    if (!this.enabled) return;
    await flush();
  }
}
