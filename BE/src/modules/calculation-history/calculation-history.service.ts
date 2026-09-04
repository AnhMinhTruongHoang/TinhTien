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
  async findAll(): Promise<any[]> {
    // console.log('===== HISTORY FIND ALL START =====');

    const histories = await this.historyModel
      .find()
      .sort({
        calculatedAt: -1,
        createdAt: -1,
      })
      .lean()
      .exec();

    // console.log('HISTORY DOCUMENTS:', histories.length);

    const result = await this.historyModel.populate(histories, {
      path: 'dailyLog',
      populate: [
        {
          path: 'owner',
        },
        {
          path: 'animalType',
        },
      ],
    });

    // console.log('===== HISTORY FIND ALL DONE =====');

    return result;
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

  ///take all
  async markMonthAsPaid(ownerId: string, animalTypeId: string, month: string) {
    const [year, mon] = month.split('-').map(Number);

    const start = new Date(year, mon - 1, 1);

    const end = new Date(year, mon, 0, 23, 59, 59, 999);

    // =====================================================
    // LẤY TOÀN BỘ HISTORY CỦA CHỦ + LOẠI + THÁNG
    // =====================================================

    const histories = await this.historyModel
      .find({
        owner: ownerId,
        animalType: animalTypeId,
        date: {
          $gte: start,
          $lte: end,
        },
      })
      .sort({
        calculatedAt: -1,
        createdAt: -1,
      })
      .lean()
      .exec();

    if (histories.length === 0) {
      return {
        updatedCount: 0,
        totalPaidAmount: 0,
        message: 'Không có ngày nào đã tính chi phí trong tháng này',
      };
    }

    // =====================================================
    // GROUP THEO DAILY LOG
    // =====================================================

    const latestHistoryMap = new Map<string, any>();

    const paidDailyLogs = new Set<string>();

    for (const history of histories) {
      if (!history.dailyLog) {
        continue;
      }

      const dailyLogId = history.dailyLog.toString();

      // Nếu bất kỳ history nào đã paid
      // thì DailyLog đó xem như đã nhận tiền
      if (history.isPaid === true) {
        paidDailyLogs.add(dailyLogId);
      }

      // histories đã sort mới nhất trước
      if (!latestHistoryMap.has(dailyLogId)) {
        latestHistoryMap.set(dailyLogId, history);
      }
    }

    // =====================================================
    // CHỈ LẤY NHỮNG DAILY LOG CHƯA PAID
    // =====================================================

    const unpaidLatestHistories = Array.from(latestHistoryMap.entries())
      .filter(([dailyLogId]) => !paidDailyLogs.has(dailyLogId))
      .map(([, history]) => history);

    if (unpaidLatestHistories.length === 0) {
      return {
        updatedCount: 0,
        totalPaidAmount: 0,
        message: 'Tất cả ngày đã tính đều đã nhận tiền',
      };
    }

    const historyIds = unpaidLatestHistories.map((history) => history._id);

    const paidAt = new Date();

    // =====================================================
    // UPDATE BULK
    // =====================================================

    const result = await this.historyModel.updateMany(
      {
        _id: {
          $in: historyIds,
        },
      },
      {
        $set: {
          isPaid: true,
          paidAt,
        },
      },
    );

    const totalPaidAmount = unpaidLatestHistories.reduce(
      (sum, history) => sum + Number(history.totalCost || 0),
      0,
    );

    return {
      updatedCount: result.modifiedCount,

      totalPaidAmount,

      paidAt,

      message: `Đã xác nhận nhận tiền ${result.modifiedCount} ngày`,
    };
  }
  ///

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
