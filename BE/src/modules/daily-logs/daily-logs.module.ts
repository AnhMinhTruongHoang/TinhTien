import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyLogsService } from './daily-logs.service';
import { DailyLogsController } from './daily-logs.controller';
import { DailyLogSchema } from './schemas/daily-log.schema';
import {
  CalculationHistory,
  CalculationHistorySchema,
} from '../calculation-history/schemas/calculation-history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DailyLog', schema: DailyLogSchema },
      {
        name: CalculationHistory.name,
        schema: CalculationHistorySchema,
      },
    ]),
  ],
  controllers: [DailyLogsController],
  providers: [DailyLogsService],
  exports: [DailyLogsService],
})
export class DailyLogsModule {}
