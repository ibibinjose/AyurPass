import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommunicationsService } from './communications.service';

@Injectable()
export class CommunicationsScheduler {
  private readonly logger = new Logger(CommunicationsScheduler.name);
  private running = false;

  constructor(private readonly communications: CommunicationsService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async dispatchDue(): Promise<void> {
    if (process.env.COMMUNICATIONS_DISPATCH_ENABLED !== 'true' || this.running) return;
    this.running = true;
    try {
      const result = await this.communications.dispatchDue();
      if (result.sent || result.retried || result.failed) {
        this.logger.log(`Communication dispatcher: sent=${result.sent} retried=${result.retried} failed=${result.failed}`);
      }
    } finally {
      this.running = false;
    }
  }
}
