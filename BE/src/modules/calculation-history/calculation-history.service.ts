import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CalculationHistoryDocument } from './schemas/calculation-history.schema';
import { CreateCalculationHistoryDto } from './dto/create-calculation-history.dto';
import { DailyLogsService } from '../daily-logs/daily-logs.service';

@Injectable()
export class CalculationHistoryService {
  constructor(
    @InjectModel('CalculationHistory')
    private historyModel: Model<CalculationHistoryDocument>,
    private dailyLogsService: DailyLogsService,
  ) {}

  ///
  async create(dto: CreateCalculationHistoryDto) {
    const dailyLog = await this.dailyLogsService.findById(dto.dailyLogId);

    const paidHistory = await this.historyModel.findOne({
      dailyLog: dto.dailyLogId,
      isPaid: true,
    });

    if (paidHistory) {
      throw new BadRequestException('đã nhận tiền, không thể tính lại chi phí');
    }

    const totalCost = dailyLog.quantity * dto.pricePerUnit;

    const ownerId =
      dailyLog.owner instanceof Types.ObjectId
        ? dailyLog.owner
        : (dailyLog.owner as any)._id;

    const animalTypeId =
      dailyLog.animalType instanceof Types.ObjectId
        ? dailyLog.animalType
        : (dailyLog.animalType as any)._id;

    const history = new this.historyModel({
      dailyLog: dto.dailyLogId,
      owner: ownerId,
      animalType: animalTypeId,
      date: dailyLog.date,
      quantity: dailyLog.quantity,
      pricePerUnit: dto.pricePerUnit,
      totalCost,
      calculatedAt: new Date(),
      isPaid: false,
    });

    return history.save();
  }
  ///
  async findAll() {
    return this.historyModel
      .find()
      .populate({
        path: 'dailyLog',
        populate: [{ path: 'owner' }, { path: 'animalType' }],
      })
      .sort({ calculatedAt: -1 })
      .exec();
  }
  ///
  async findByDailyLog(dailyLogId: string) {
    return this.historyModel
      .find({ dailyLog: dailyLogId })
      .populate({
        path: 'dailyLog',
        populate: [{ path: 'owner' }, { path: 'animalType' }],
      })
      .sort({ calculatedAt: -1 })
      .exec();
  }

  async findById(id: string) {
    const history = await this.historyModel
      .findById(id)
      .populate({
        path: 'dailyLog',
        populate: [{ path: 'owner' }, { path: 'animalType' }],
      })
      .exec();

    if (!history) {
      throw new NotFoundException(`Calculation history ${id} not found`);
    }
    return history;
  }

  async delete(id: string) {
    const history = await this.historyModel.findByIdAndDelete(id);
    if (!history) {
      throw new NotFoundException(`Calculation history ${id} not found`);
    }
    return history;
  }

  async findByMonth(month: string) {
    const [year, mon] = month.split('-').map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 0, 23, 59, 59, 999);

    return this.historyModel
      .find({
        date: { $gte: start, $lte: end },
      })
      .populate({
        path: 'dailyLog',
        populate: [{ path: 'owner' }, { path: 'animalType' }],
      })
      .sort({ calculatedAt: -1 })
      .exec();
  }

  async markAsPaid(id: string) {
    const history = await this.historyModel.findById(id);

    if (!history) {
      throw new NotFoundException('Calculation history not found');
    }

    if (history.isPaid) {
      return history;
    }

    const alreadyPaid = await this.historyModel.findOne({
      dailyLog: history.dailyLog,
      isPaid: true,
    });

    if (alreadyPaid) {
      throw new BadRequestException('Daily log này đã được thanh toán');
    }

    history.isPaid = true;
    history.paidAt = new Date();

    return history.save();
  }
}
