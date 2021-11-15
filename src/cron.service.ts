import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { BotService } from './bot.service';

@Injectable()
export class CronService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    @Inject(forwardRef(() => BotService))
    private botService: BotService,
    private configService: ConfigService,
  ) {}
  private readonly logger = new Logger();
  addCronJob(name: string, minutes?: number): void {
    const job = new CronJob(
      minutes
        ? `*/${minutes} * * * *`
        : `0 0 ${this.configService.get('START_HOUR')} * * *`,
      () => {
        this.logger.warn(`time (${minutes}) for job ${name} to run!`);
        this.botService.sendMessage();
      },
    );

    this.schedulerRegistry.addCronJob(name, job);
    job.start();
    this.logger.warn(
      `job ${name} added for each minute at ${minutes} minutes!`,
    );
  }
  deleteCron(name: string): void {
    this.schedulerRegistry.deleteCronJob(name);
    this.logger.warn(`job ${name} deleted!`);
  }
  getCrons(): void {
    const jobs = this.schedulerRegistry.getCronJobs();
    jobs.forEach((value, key) => {
      let next;

      try {
        next = value.nextDates().toDate();
      } catch (e) {
        next = 'error: next fire date is in the past!';
      }

      this.logger.log(`job: ${key} -> next: ${next}`);
    });
  }
  getCron(name: string): boolean {
    return this.schedulerRegistry.doesExists('cron', name);
  }
}
