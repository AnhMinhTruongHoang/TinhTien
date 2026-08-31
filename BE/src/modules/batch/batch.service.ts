import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { CalculateCostDto } from './dto/calculate-cost.dto';
import { BatchDocument } from './schemas/batch.schemas';

@Injectable()
export class BatchesService {
  constructor(@InjectModel('Batch') private batchModel: Model<BatchDocument>) {}

  async create(dto: CreateBatchDto) {
    const created = new this.batchModel({
      owner: dto.ownerId,
      originAddress: dto.originAddress,
      destinationAddress: dto.destinationAddress,
      animalType: dto.animalTypeId,
      quantity: dto.quantity,
      quantityNotSlaughtered: dto.quantityNotSlaughtered ?? 0,
      notes: dto.notes,
      recordDate: dto.recordDate ? new Date(dto.recordDate) : new Date(),
    });
    return created.save();
  }

  async findAll() {
    return this.batchModel.find().populate('owner animalType').exec();
  }

  async findById(id: string) {
    const batch = await this.batchModel
      .findById(id)
      .populate('owner animalType')
      .exec();
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
    return batch;
  }

  async update(id: string, dto: UpdateBatchDto) {
    const batch = await this.batchModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
    return batch;
  }

  async delete(id: string) {
    const batch = await this.batchModel.findByIdAndDelete(id);
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
    return batch;
  }

  async calculateCost(dto: CalculateCostDto) {
    const batch = await this.findById(dto.batchId);

    // Tính chi phí mua động vật
    const animalCost = batch.quantity * dto.pricePerUnit;

    // Tính chi phí giết mổ (chỉ những con bị giết)
    const slaughterQuantity = batch.quantity - batch.quantityNotSlaughtered;
    const slaughterCost = slaughterQuantity * (dto.slaughterPricePerUnit ?? 0);

    // Tính chi phí vận chuyển (nếu có)
    const transportCost = dto.transportCost ?? 0;

    // Tính tổng chi phí
    const totalCost = animalCost + slaughterCost + transportCost;

    // Tính chi phí trung bình trên đầu
    const costPerUnit = batch.quantity > 0 ? totalCost / batch.quantity : 0;

    return {
      batchId: batch._id,
      quantity: batch.quantity,
      quantityNotSlaughtered: batch.quantityNotSlaughtered,
      slaughterQuantity,
      animalCost,
      slaughterCost,
      transportCost,
      totalCost,
      costPerUnit: Math.round(costPerUnit * 100) / 100,
    };
  }

  async getBatchesByOwner(ownerId: string) {
    return this.batchModel
      .find({ owner: ownerId })
      .populate('animalType')
      .exec();
  }

  async getBatchesByAnimalType(animalTypeId: string) {
    return this.batchModel
      .find({ animalType: animalTypeId })
      .populate('owner')
      .exec();
  }
}
