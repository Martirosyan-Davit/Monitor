import { Module } from '@nestjs/common';
import { MonitorService } from './monitor.service';
import { InstagramModule } from '../instagram/instagram.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [InstagramModule, StorageModule],
  providers: [MonitorService],
  exports: [MonitorService],
})
export class MonitorModule {}
