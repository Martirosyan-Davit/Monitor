import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('Bootstrap');

  const port = process.env.PORT || 3000;
  const serviceUrl =
    process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
  const http = await import('http');

  http
    .createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
    })
    .listen(port);

  // Self-ping every 1 minute to prevent Render free tier sleep
  setInterval(() => {
    fetch(`${serviceUrl}/health`)
      .then((r) => logger.debug(`Keep-alive ping: ${r.status}`))
      .catch(() =>
        logger.debug('Keep-alive ping failed, will retry next interval'),
      );
  }, 60 * 1000);

  logger.log(
    `Bot is running on port ${port}. Send /start to your Telegram bot.`,
  );
  logger.log(`Keep-alive pinging ${serviceUrl} every 60s`);
}

void bootstrap();
