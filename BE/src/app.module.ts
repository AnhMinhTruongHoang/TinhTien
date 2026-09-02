import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OwnerModule } from './modules/owners/owners.module';
import { AnimalTypeModule } from './modules/animal-types/animal-types.module';
import { BatchesModule } from './modules/batch/batch.module';
import { CalculationHistoryModule } from './modules/calculation-history/calculation-history.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/TinhTien',
    ),
    OwnerModule,
    AnimalTypeModule,
    BatchesModule,
    CalculationHistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
