import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CalculationHistoryDocument } from './schemas/calculation-history.schema';
import { CreateCalculationHistoryDto } from './dto/create-calculation-history.dto';
import { BatchesService } from '../batch/batch.service';

@Injectable()
export class CalculationHistoryService {
  constructor(
    @InjectModel('CalculationHistory')
    private historyModel: Model<CalculationHistoryDocument>,
    private batchesService: BatchesService,
  ) {}

  async create(dto: CreateCalculationHistoryDto) {
    // Tái sử dụng logic tính toán hiện có
    const result = await this.batchesService.calculateCost({
      batchId: dto.batchId,
      pricePerUnit: dto.pricePerUnit,
      slaughterPricePerUnit: dto.slaughterPricePerUnit,
      transportCost: dto.transportCost,
    });

    const history = new this.historyModel({
      batch: dto.batchId,
      pricePerUnit: dto.pricePerUnit,
      slaughterPricePerUnit: dto.slaughterPricePerUnit ?? 0,
      transportCost: dto.transportCost ?? 0,
      quantity: result.quantity,
      quantityNotSlaughtered: result.quantityNotSlaughtered,
      slaughterQuantity: result.slaughterQuantity,
      animalCost: result.animalCost,
      slaughterCost: result.slaughterCost,
      totalCost: result.totalCost,
      costPerUnit: result.costPerUnit,
      calculatedAt: new Date(),
    });

    return history.save();
  }

  async findAll() {
    return this.historyModel
      .find()
      .populate({
        path: 'batch',
        populate: [{ path: 'owner' }, { path: 'animalType' }],
      })
      .sort({ calculatedAt: -1 })
      .exec();
  }

  async findByBatch(batchId: string) {
    return this.historyModel
      .find({ batch: batchId })
      .populate({
        path: 'batch',
        populate: [{ path: 'owner' }, { path: 'animalType' }],
      })
      .sort({ calculatedAt: -1 })
      .exec();
  }

  async findById(id: string) {
    const history = await this.historyModel
      .findById(id)
      .populate({
        path: 'batch',
        populate: [{ path: 'owner' }, { path: 'animalType' }],
      })
      .exec();

    if (!history) {
      throw new NotFoundException(
        `Calculation history with ID ${id} not found`,
      );
    }
    return history;
  }

  async delete(id: string) {
    const history = await this.historyModel.findByIdAndDelete(id);
    if (!history) {
      throw new NotFoundException(
        `Calculation history with ID ${id} not found`,
      );
    }
    return history;
  }

  async deleteByBatch(batchId: string) {
    return this.historyModel.deleteMany({ batch: batchId });
  }
}
