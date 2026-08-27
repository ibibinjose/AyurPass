import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { CommunicationsService } from './communications.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'warn', 'error'] });
  try {
    const communications = app.get(CommunicationsService);
    const result = await communications.dispatchDue(`ecs-dispatch-${process.env.HOSTNAME || process.pid}`);
    // Structured, non-sensitive summary for CloudWatch and EventBridge task logs.
    console.log(JSON.stringify({ event: 'communications_dispatch_complete', ...result }));
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error('communications_dispatch_failed', error);
  process.exitCode = 1;
});
