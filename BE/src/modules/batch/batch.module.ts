import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Owner, OwnerSchema } from '../owners/schemas/owner.schemas';
import {
  AnimalType,
  AnimalTypeSchema,
} from '../animal-types/schemas/animal-type.schemas';
import { Batch, BatchSchema } from './schemas/batch.schemas';
import { BatchesController } from './batch.controller';
import { BatchesService } from './batch.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Owner.name, schema: OwnerSchema },
      { name: AnimalType.name, schema: AnimalTypeSchema },
      { name: Batch.name, schema: BatchSchema },
    ]),
  ],
  controllers: [BatchesController],
  providers: [BatchesService],
  exports: [BatchesService],
})
export class BatchesModule {}
