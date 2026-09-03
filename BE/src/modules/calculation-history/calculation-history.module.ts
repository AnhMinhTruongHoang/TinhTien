import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CalculationHistory,
  CalculationHistorySchema,
} from './schemas/calculation-history.schema';
import { CalculationHistoryService } from './calculation-history.service';
import { CalculationHistoryController } from './calculation-history.controller';
import { DailyLogsModule } from '../daily-logs/daily-logs.module'; // ← thêm dòng này

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CalculationHistory.name, schema: CalculationHistorySchema },
    ]),
    DailyLogsModule, // ← thay BatchesModule bằng DailyLogsModule
  ],
  controllers: [CalculationHistoryController],
  providers: [CalculationHistoryService],
  exports: [CalculationHistoryService],
})
export class CalculationHistoryModule {}
