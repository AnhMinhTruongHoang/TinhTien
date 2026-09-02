import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CalculationHistory,
  CalculationHistorySchema,
} from './schemas/calculation-history.schema';
import { CalculationHistoryService } from './calculation-history.service';
import { CalculationHistoryController } from './calculation-history.controller';
import { BatchesModule } from '../batch/batch.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CalculationHistory.name, schema: CalculationHistorySchema },
    ]),
    BatchesModule, // để inject được BatchesService
  ],
  controllers: [CalculationHistoryController],
  providers: [CalculationHistoryService],
  exports: [CalculationHistoryService],
})
export class CalculationHistoryModule {}
