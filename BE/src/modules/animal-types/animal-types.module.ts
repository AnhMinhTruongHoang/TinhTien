import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnimalType, AnimalTypeSchema } from './schemas/animal-type.schemas';
import { AnimalTypesController } from './animal-types.controller';
import { AnimalTypeService } from './animal-types.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnimalType.name, schema: AnimalTypeSchema },
    ]),
  ],
  controllers: [AnimalTypesController],
  providers: [AnimalTypeService],
  exports: [AnimalTypeService],
})
export class AnimalTypeModule implements OnModuleInit {
  constructor(private animalTypeService: AnimalTypeService) {}

  async onModuleInit() {
    await this.animalTypeService.seedDefaultAnimalTypes();
  }
}
