import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotModule } from './bot/bot.module';
import { StorageModule } from './storage/storage.module';
import { InstagramModule } from './instagram/instagram.module';
import { MonitorModule } from './monitor/monitor.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN'),
      }),
    }),
    StorageModule,
    InstagramModule,
    MonitorModule,
    BotModule,
  ],
})
export class AppModule {}
