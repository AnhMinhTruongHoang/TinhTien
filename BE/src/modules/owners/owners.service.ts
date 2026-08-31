import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Owner, OwnerDocument } from './schemas/owner.schemas';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';

@Injectable()
export class OwnersService {
  constructor(
    @InjectModel(Owner.name) private ownerModel: Model<OwnerDocument>,
  ) {}

  async create(dto: CreateOwnerDto): Promise<OwnerDocument> {
    const owner = new this.ownerModel(dto);
    return owner.save();
  }

  async findAll(): Promise<OwnerDocument[]> {
    return this.ownerModel.find().exec();
  }

  async findById(id: string): Promise<OwnerDocument> {
    const owner = await this.ownerModel.findById(id).exec();
    if (!owner) {
      throw new NotFoundException(`Owner with ID ${id} not found`);
    }
    return owner;
  }

  async update(id: string, dto: UpdateOwnerDto): Promise<OwnerDocument> {
    const owner = await this.ownerModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!owner) {
      throw new NotFoundException(`Owner with ID ${id} not found`);
    }
    return owner;
  }

  async delete(id: string): Promise<OwnerDocument> {
    const owner = await this.ownerModel.findByIdAndDelete(id).exec();
    if (!owner) {
      throw new NotFoundException(`Owner with ID ${id} not found`);
    }
    return owner;
  }
}
