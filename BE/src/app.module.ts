import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OwnerModule } from './modules/owners/owners.module';
import { AnimalTypeModule } from './modules/animal-types/animal-types.module';
import { CalculationHistoryModule } from './modules/calculation-history/calculation-history.module';
import { DailyLogsModule } from './modules/daily-logs/daily-logs.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/TinhTien',
    ),
    OwnerModule,
    AnimalTypeModule,
    CalculationHistoryModule,
    DailyLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
