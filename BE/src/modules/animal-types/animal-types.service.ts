import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AnimalType, AnimalTypeDocument } from './schemas/animal-type.schemas';
import { CreateAnimalTypeDto } from './dto/create-animal-type.dto';
import { UpdateAnimalTypeDto } from './dto/update-animal-type.dto';

@Injectable()
export class AnimalTypesService {
  constructor(
    @InjectModel(AnimalType.name)
    private animalTypeModel: Model<AnimalTypeDocument>,
  ) {}

  async create(dto: CreateAnimalTypeDto): Promise<AnimalTypeDocument> {
    const animalType = new this.animalTypeModel(dto);
    return animalType.save();
  }

  async findAll(): Promise<AnimalTypeDocument[]> {
    return this.animalTypeModel.find().exec();
  }

  async findById(id: string): Promise<AnimalTypeDocument> {
    const animalType = await this.animalTypeModel.findById(id).exec();
    if (!animalType) {
      throw new NotFoundException(`AnimalType with ID ${id} not found`);
    }
    return animalType;
  }

  async update(
    id: string,
    dto: UpdateAnimalTypeDto,
  ): Promise<AnimalTypeDocument> {
    const animalType = await this.animalTypeModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!animalType) {
      throw new NotFoundException(`AnimalType with ID ${id} not found`);
    }
    return animalType;
  }

  async delete(id: string): Promise<AnimalTypeDocument> {
    const animalType = await this.animalTypeModel.findByIdAndDelete(id).exec();
    if (!animalType) {
      throw new NotFoundException(`AnimalType with ID ${id} not found`);
    }
    return animalType;
  }
}
