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
    private readonly historyModel: Model<CalculationHistoryDocument>,

    private readonly dailyLogsService: DailyLogsService,
  ) {}

  // =====================================================
  // CREATE CALCULATION
  // =====================================================

  async create(dto: CreateCalculationHistoryDto) {
    const dailyLog = await this.dailyLogsService.findById(dto.dailyLogId);

    // Nếu DailyLog đã từng được xác nhận thanh toán
    // thì không cho tính lại nữa
    const paidHistory = await this.historyModel.findOne({
      dailyLog: dto.dailyLogId,
      isPaid: true,
    });

    if (paidHistory) {
      throw new BadRequestException('Đã nhận tiền, không thể tính lại chi phí');
    }

    const totalCost =
      Number(dailyLog.quantity || 0) * Number(dto.pricePerUnit || 0);

    const ownerId =
      dailyLog.owner instanceof Types.ObjectId
        ? dailyLog.owner
        : (dailyLog.owner as any)?._id;

    const animalTypeId =
      dailyLog.animalType instanceof Types.ObjectId
        ? dailyLog.animalType
        : (dailyLog.animalType as any)?._id;

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

  // =====================================================
  // FIND ALL
  // =====================================================

  async findAll(): Promise<any[]> {
    const histories = await this.historyModel
      .find()
      .sort({
        calculatedAt: -1,
        createdAt: -1,
      })
      .lean()
      .exec();

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

    return result;
  }

  // =====================================================
  // FIND HISTORY BY DAILY LOG
  // =====================================================

  async findByDailyLog(dailyLogId: string) {
    return this.historyModel
      .find({
        dailyLog: dailyLogId,
      })
      .populate({
        path: 'dailyLog',

        populate: [
          {
            path: 'owner',
          },
          {
            path: 'animalType',
          },
        ],
      })
      .sort({
        calculatedAt: -1,
      })
      .exec();
  }

  // =====================================================
  // FIND ONE
  // =====================================================

  async findById(id: string) {
    const history = await this.historyModel
      .findById(id)
      .populate({
        path: 'dailyLog',

        populate: [
          {
            path: 'owner',
          },
          {
            path: 'animalType',
          },
        ],
      })
      .exec();

    if (!history) {
      throw new NotFoundException(`Calculation history ${id} not found`);
    }

    return history;
  }

  // =====================================================
  // DELETE ONE CALCULATION HISTORY
  // =====================================================

  async delete(id: string) {
    const history = await this.historyModel.findByIdAndDelete(id);

    if (!history) {
      throw new NotFoundException(`Calculation history ${id} not found`);
    }

    return {
      message: 'Xóa lịch sử tính chi phí thành công',
      deletedId: id,
    };
  }

  // =====================================================
  // FIND BY MONTH
  // =====================================================

  async findByMonth(month: string) {
    const [year, mon] = month.split('-').map(Number);

    const start = new Date(year, mon - 1, 1);

    const end = new Date(year, mon, 0, 23, 59, 59, 999);

    return this.historyModel
      .find({
        date: {
          $gte: start,
          $lte: end,
        },
      })
      .populate({
        path: 'dailyLog',

        populate: [
          {
            path: 'owner',
          },
          {
            path: 'animalType',
          },
        ],
      })
      .sort({
        calculatedAt: -1,
      })
      .exec();
  }

  // =====================================================
  // MARK ALL UNPAID DAYS IN MONTH AS PAID
  // =====================================================

  async markMonthAsPaid(ownerId: string, animalTypeId: string, month: string) {
    // =====================================================
    // DATE RANGE
    // =====================================================

    const [year, mon] = month.split('-').map(Number);

    const start = new Date(year, mon - 1, 1);

    const end = new Date(year, mon, 0, 23, 59, 59, 999);

    // =====================================================
    // LẤY HISTORY ĐÚNG CHỦ + LOẠI + THÁNG
    //
    // Không populate dailyLog ở đây
    // để dailyLog vẫn giữ ObjectId.
    // =====================================================

    const histories = await this.historyModel
      .find({
        owner: new Types.ObjectId(ownerId),

        animalType: new Types.ObjectId(animalTypeId),

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
    // GROUP HISTORY THEO DAILY LOG
    // =====================================================

    const latestHistoryMap = new Map<string, any>();

    const paidDailyLogs = new Set<string>();

    for (const history of histories) {
      if (!history.dailyLog) {
        continue;
      }

      const dailyLogId = history.dailyLog.toString();

      // Nếu DailyLog có bất kỳ history nào đã paid
      // thì xem DailyLog đó đã thanh toán
      if (history.isPaid === true) {
        paidDailyLogs.add(dailyLogId);
      }

      // histories đã sort mới nhất -> cũ
      // nên lần đầu gặp chính là history mới nhất
      if (!latestHistoryMap.has(dailyLogId)) {
        latestHistoryMap.set(dailyLogId, history);
      }
    }

    // =====================================================
    // CHỈ LẤY HISTORY MỚI NHẤT
    // CỦA DAILY LOG CHƯA THANH TOÁN
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

    // =====================================================
    // UPDATE
    // =====================================================

    const historyIds = unpaidLatestHistories.map((history) => history._id);

    const paidAt = new Date();

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

    // =====================================================
    // TOTAL PAID
    // =====================================================

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

  // =====================================================
  // MARK ONE CALCULATION AS PAID
  // =====================================================

  async markAsPaid(id: string) {
    const history = await this.historyModel.findById(id);

    if (!history) {
      throw new NotFoundException('Calculation history not found');
    }

    if (history.isPaid) {
      return history;
    }

    // Kiểm tra DailyLog này đã có history nào paid chưa
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

  // =====================================================
  // CLEANUP ORPHAN CALCULATION HISTORIES
  //
  // History còn tồn tại nhưng DailyLog gốc đã bị xóa.
  // =====================================================

  async cleanupOrphanHistories() {
    const histories = await this.historyModel
      .find()
      .select('_id dailyLog')
      .lean()
      .exec();

    const orphanIds: any[] = [];

    for (const history of histories) {
      if (!history.dailyLog) {
        orphanIds.push(history._id);

        continue;
      }

      try {
        await this.dailyLogsService.findById(history.dailyLog.toString());
      } catch {
        orphanIds.push(history._id);
      }
    }

    if (orphanIds.length === 0) {
      return {
        deletedCount: 0,

        message: 'Không có history mồ côi',
      };
    }

    const result = await this.historyModel.deleteMany({
      _id: {
        $in: orphanIds,
      },
    });

    return {
      deletedCount: result.deletedCount,

      message: `Đã xóa ${result.deletedCount} history mồ côi`,
    };
  }
}
