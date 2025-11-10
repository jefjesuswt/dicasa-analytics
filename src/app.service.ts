import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  logger = new Logger('AppService');

  getHello(): string {
    return 'Hello World!';
  }

  getHealthStatus() {
    const currentTime = new Date().toISOString();
    this.logger.log(`Health check, current time: ${currentTime}`);
    return { status: 'ok', timestamp: currentTime };
  }
}
