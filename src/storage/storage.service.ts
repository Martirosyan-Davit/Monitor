import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { StorageData } from '../common/interfaces/types';
import { STORAGE_FILE_PATH } from '../common/constants';

const DEFAULT_DATA: StorageData = {
  chatId: null,
  monitoredAccounts: [],
  sentStoryIds: {},
};

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly filePath = path.resolve(STORAGE_FILE_PATH);
  private data: StorageData = { ...DEFAULT_DATA, sentStoryIds: {} };

  onModuleInit() {
    const dir = path.dirname(this.filePath);
    fs.mkdirSync(dir, { recursive: true });

    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(raw) as StorageData;
      } catch (err) {
        this.logger.error(`Failed to read storage file: ${(err as Error).message}`);
        this.data = { ...DEFAULT_DATA, sentStoryIds: {} };
      }
    } else {
      this.save(this.data);
    }
  }

  load(): StorageData {
    return this.data;
  }

  save(data: StorageData): void {
    this.data = data;
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      this.logger.error(`Failed to write storage file: ${(err as Error).message}`);
    }
  }

  addAccount(username: string): boolean {
    const normalized = username.toLowerCase().trim().replace(/^@/, '');
    if (this.data.monitoredAccounts.includes(normalized)) return false;
    this.data.monitoredAccounts.push(normalized);
    this.save(this.data);
    return true;
  }

  removeAccount(username: string): boolean {
    const normalized = username.toLowerCase().trim().replace(/^@/, '');
    const idx = this.data.monitoredAccounts.indexOf(normalized);
    if (idx === -1) return false;
    this.data.monitoredAccounts.splice(idx, 1);
    delete this.data.sentStoryIds[normalized];
    this.save(this.data);
    return true;
  }

  getAccounts(): string[] {
    return [...this.data.monitoredAccounts];
  }

  isStorySent(username: string, storyId: string): boolean {
    return (this.data.sentStoryIds[username] ?? []).includes(storyId);
  }

  markStorySent(username: string, storyId: string): void {
    if (!this.data.sentStoryIds[username]) {
      this.data.sentStoryIds[username] = [];
    }
    this.data.sentStoryIds[username].push(storyId);
    this.save(this.data);
  }

  setChatId(chatId: number): void {
    this.data.chatId = chatId;
    this.save(this.data);
  }

  getChatId(): number | null {
    return this.data.chatId;
  }

  clearHistory(): void {
    this.data.sentStoryIds = {};
    this.save(this.data);
  }

  clearAll(): void {
    this.data = { ...DEFAULT_DATA, sentStoryIds: {} };
    this.save(this.data);
  }
}
