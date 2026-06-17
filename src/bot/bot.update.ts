import { Command, Ctx, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.reply(this.botService.getWelcomeMessage());
  }

  @Command('add')
  async onAdd(@Ctx() ctx: Context) {
    const text = (ctx.message as any)?.text ?? '';
    const parts = text.trim().split(/\s+/);
    const username = parts[1];

    if (!username) {
      await ctx.reply('Использование: /add <username>');
      return;
    }

    const chatId = ctx.chat!.id;
    await ctx.reply(this.botService.handleAdd(chatId, username));
  }

  @Command('list')
  async onList(@Ctx() ctx: Context) {
    await ctx.reply(this.botService.handleList());
  }

  @Command('remove')
  async onRemove(@Ctx() ctx: Context) {
    const text = (ctx.message as any)?.text ?? '';
    const parts = text.trim().split(/\s+/);
    const username = parts[1];

    if (!username) {
      await ctx.reply('Использование: /remove <username>');
      return;
    }

    await ctx.reply(this.botService.handleRemove(username));
  }

  @Command('monitor')
  async onMonitor(@Ctx() ctx: Context) {
    const chatId = ctx.chat!.id;
    await ctx.reply(this.botService.handleMonitor(chatId));
  }

  @Command('stop')
  async onStop(@Ctx() ctx: Context) {
    await ctx.reply(this.botService.handleStop());
  }
}
