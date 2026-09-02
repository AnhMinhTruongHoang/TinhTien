import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAnimalTypeDto } from './dto/create-animal-type.dto';
import { UpdateAnimalTypeDto } from './dto/update-animal-type.dto';
import { AnimalType } from './schemas/animal-type.schemas';

@Injectable()
export class AnimalTypeService {
  constructor(
    @InjectModel(AnimalType.name) private animalTypeModel: Model<AnimalType>,
  ) {}

  async seedDefaultAnimalTypes() {
    const count = await this.animalTypeModel.countDocuments();
    if (count > 0) {
      console.log('✅ Animal types already exist, skipping seed');
      return;
    }

    const defaultAnimalTypes = [
      { name: 'Heo', unit: 'con', description: 'Lợn nuôi' },
      { name: 'Bò', unit: 'con', description: 'Bò nuôi' },
      { name: 'Gà', unit: 'con', description: 'Gà nuôi' },
      { name: 'Trâu', unit: 'con', description: 'Trâu nuôi' },
    ];

    try {
      const created = await this.animalTypeModel.insertMany(defaultAnimalTypes);
      console.log(`✅ Seeded ${created.length} default animal types`);
    } catch (error) {
      console.error('❌ Error seeding animal types:', error.message);
    }
  }

  create(createAnimalTypeDto: CreateAnimalTypeDto) {
    const animalType = new this.animalTypeModel(createAnimalTypeDto);
    return animalType.save();
  }

  findAll() {
    return this.animalTypeModel.find();
  }

  findById(id: string) {
    return this.animalTypeModel.findById(id);
  }

  update(id: string, updateAnimalTypeDto: UpdateAnimalTypeDto) {
    return this.animalTypeModel.findByIdAndUpdate(id, updateAnimalTypeDto, {
      new: true,
    });
  }

  delete(id: string) {
    return this.animalTypeModel.findByIdAndDelete(id);
  }
}
