import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { BotService } from './bot.service';
import { StorageModule } from '../storage/storage.module';
import { MonitorModule } from '../monitor/monitor.module';

@Module({
  imports: [StorageModule, MonitorModule],
  providers: [BotUpdate, BotService],
})
export class BotModule {}
