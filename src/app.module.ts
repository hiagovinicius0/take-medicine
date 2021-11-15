import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegramModule } from 'nestjs-telegram';
import { BotService } from './bot.service';
import { CronService } from './cron.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TelegramModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        botKey: configService.get('TOKEN_TELEGRAM'),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [BotService, CronService],
})
export class AppModule {}
