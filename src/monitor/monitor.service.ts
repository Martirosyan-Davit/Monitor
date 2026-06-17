import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { InstagramService } from '../instagram/instagram.service';
import { StorageService } from '../storage/storage.service';
import { MONITORING_INTERVAL_MS, MONITORING_JITTER_MS, INTER_ACCOUNT_DELAY_MS } from '../common/constants';

@Injectable()
export class MonitorService implements OnModuleDestroy {
  private readonly logger = new Logger(MonitorService.name);
  private isRunning = false;
  private timeoutHandle: NodeJS.Timeout | null = null;

  constructor(
    private readonly instagramService: InstagramService,
    private readonly storageService: StorageService,
    @InjectBot() private readonly bot: Telegraf,
  ) {}

  isMonitoring(): boolean {
    return this.isRunning;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.scheduleNext(0);
  }

  stop(): void {
    this.isRunning = false;
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
  }

  onModuleDestroy() {
    this.stop();
  }

  private scheduleNext(delayMs: number): void {
    this.timeoutHandle = setTimeout(() => {
      this.runCycle().finally(() => {
        if (this.isRunning) {
          const jitter = Math.floor(Math.random() * MONITORING_JITTER_MS);
          this.scheduleNext(MONITORING_INTERVAL_MS + jitter);
        }
      });
    }, delayMs);
  }

  private async runCycle(): Promise<void> {
    const accounts = this.storageService.getAccounts();
    const chatId = this.storageService.getChatId();

    if (accounts.length === 0 || chatId === null) return;

    this.logger.log(`Checking stories for: ${accounts.join(', ')}`);

    for (const username of accounts) {
      try {
        await this.checkAccount(username, chatId);
      } catch (err) {
        this.logger.error(`Failed to check @${username}: ${(err as Error).message}`);
      }

      if (accounts.indexOf(username) < accounts.length - 1) {
        await this.delay(INTER_ACCOUNT_DELAY_MS);
      }
    }
  }

  private async checkAccount(username: string, chatId: number): Promise<void> {
    const stories = await this.instagramService.fetchStories(username);

    for (const story of stories) {
      if (this.storageService.isStorySent(username, story.storyId)) continue;

      this.logger.log(`New story found for @${username}: ID=${story.storyId}`);

      try {
        const buffer = await this.instagramService.downloadMedia(story.mediaUrl);

        let caption: string;

        if (username === 'iamiiness') {
          caption = `Новая сторис от любимой 💖 @${username}`;
        } else {
          caption =
            story.mediaType === 'video'
              ? `🎬 Новая сторис от @${username}`
              : `📸 Новая сторис от @${username}`;
        }

        if (story.mediaType === 'video') {
          await this.bot.telegram.sendVideo(chatId, { source: buffer }, { caption });
        } else {
          await this.bot.telegram.sendPhoto(chatId, { source: buffer }, { caption });
        }

        this.storageService.markStorySent(username, story.storyId);
      } catch (err) {
        this.logger.error(
          `Failed to send story ${story.storyId} for @${username}: ${(err as Error).message}`,
        );
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
