import { Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { MonitorService } from '../monitor/monitor.service';

@Injectable()
export class BotService {
  constructor(
    private readonly storageService: StorageService,
    private readonly monitorService: MonitorService,
  ) {}

  getWelcomeMessage(): string {
    return (
      '👋 Instagram Stories Monitor Bot\n\n' +
      'Команды:\n' +
      '/add <username> — добавить аккаунт для мониторинга\n' +
      '/list — показать список отслеживаемых аккаунтов\n' +
      '/remove <username> — убрать аккаунт из списка\n' +
      '/monitor — запустить мониторинг (проверка каждые ~5 мин)\n' +
      '/stop — остановить мониторинг и удалить все данные'
    );
  }

  handleAdd(chatId: number, username: string): string {
    const normalized = username.toLowerCase().trim().replace(/^@/, '');
    if (!this.storageService.getChatId()) {
      this.storageService.setChatId(chatId);
    }
    const added = this.storageService.addAccount(normalized);
    if (!added) return `⚠️ @${normalized} уже в списке`;
    return `✅ @${normalized} добавлен в список мониторинга`;
  }

  handleList(): string {
    const accounts = this.storageService.getAccounts();
    if (accounts.length === 0) return 'Список пуст. Используйте /add <username>';
    const list = accounts.map((a, i) => `${i + 1}. @${a}`).join('\n');
    return `📋 Отслеживаемые аккаунты:\n${list}`;
  }

  handleRemove(username: string): string {
    const normalized = username.toLowerCase().trim().replace(/^@/, '');
    const removed = this.storageService.removeAccount(normalized);
    if (!removed) return `⚠️ @${normalized} не найден в списке`;
    return `✅ @${normalized} удален`;
  }

  handleMonitor(chatId: number): string {
    const accounts = this.storageService.getAccounts();
    if (accounts.length === 0) return '⚠️ Сначала добавьте аккаунты через /add';
    if (this.monitorService.isMonitoring()) return '⚠️ Мониторинг уже запущен';
    if (!this.storageService.getChatId()) {
      this.storageService.setChatId(chatId);
    }
    this.monitorService.start();
    return '🚀 Мониторинг запущен! Проверка каждые ~5 минут';
  }

  handleStop(): string {
    this.monitorService.stop();
    this.storageService.clearHistory();
    return '🛑 Мониторинг остановлен. История отправок очищена. Аккаунты сохранены — используйте /monitor чтобы запустить снова.';
  }
}
