import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('Bootstrap');

  // Render requires an open port for Web Services
  const port = process.env.PORT || 3000;
  const http = await import('http');
  http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running');
  }).listen(port);

  logger.log(`Bot is running on port ${port}. Send /start to your Telegram bot.`);
}

bootstrap();
