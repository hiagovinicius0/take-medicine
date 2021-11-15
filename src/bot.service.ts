/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TelegramCallbackQuery,
  TelegramMessage,
  TelegramService,
} from 'nestjs-telegram';
import { OptionBox } from './constants';
import { CronService } from './cron.service';

@Injectable()
export class BotService implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    private readonly telegramService: TelegramService,
    public readonly cronService: CronService,
  ) {}

  onModuleInit(): void {
    this.botMessage();
    this.sendMessage(true);
  }
  async botMessage(): Promise<void> {
    process.env.NTBA_FIX_319 = '1';
    const token = this.configService.get('TOKEN_TELEGRAM');
    const TelegramBot = require('node-telegram-bot-api');
    const bot = new TelegramBot(token, { polling: true });

    bot.on('callback_query', async (msg: TelegramCallbackQuery) => {
      if (msg.data.includes('yes')) {
        await bot.sendMessage(msg.from.id, 'Ok!');
        this.cronService.deleteCron('remember');
      }

      if (msg.data.includes('no')) {
        bot.sendMessage(msg.from.id, 'Ok!');
      }
    });
  }

  async sendMessage(cronJob?: boolean): Promise<TelegramMessage> {
    if (cronJob) {
      const findRemember = this.cronService.getCron('remember');
      if (!findRemember)
        this.cronService.addCronJob(
          'remember',
          this.configService.get('REMEMBER_EVERY'),
        );
    }

    const findDaily = this.cronService.getCron('daily');
    if (!findDaily) this.cronService.addCronJob('daily');

    return this.telegramService
      .sendMessage({
        chat_id: this.configService.get('CHAT_ID_TELEGRAM'),
        text: this.configService.get('CHAT_MESSAGE'),
        reply_markup: OptionBox.reply_markup,
      })
      .toPromise();
  }
}
