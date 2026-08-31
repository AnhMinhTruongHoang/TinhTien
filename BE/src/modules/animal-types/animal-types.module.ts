import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnimalTypesService } from './animal-types.service';
import { AnimalTypesController } from './animal-types.controller';
import { AnimalType, AnimalTypeSchema } from './schemas/animal-type.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnimalType.name, schema: AnimalTypeSchema },
    ]),
  ],
  controllers: [AnimalTypesController],
  providers: [AnimalTypesService],
  exports: [AnimalTypesService],
})
export class AnimalTypesModule {}
