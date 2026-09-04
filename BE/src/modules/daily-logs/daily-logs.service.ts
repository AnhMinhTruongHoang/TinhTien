import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { DailyLogDocument } from './schemas/daily-log.schema';
import { CreateDailyLogDto } from './dto/create-daily-log.dto';
import { UpdateDailyLogDto } from './dto/update-daily-log.dto';

import { CalculationHistoryDocument } from '../calculation-history/schemas/calculation-history.schema';

@Injectable()
export class DailyLogsService {
  constructor(
    @InjectModel('DailyLog')
    private readonly dailyLogModel: Model<DailyLogDocument>,

    @InjectModel('CalculationHistory')
    private readonly historyModel: Model<CalculationHistoryDocument>,
  ) {}

  // =====================================================
  // CREATE
  // =====================================================

  async create(dto: CreateDailyLogDto) {
    const created = new this.dailyLogModel({
      owner: dto.ownerId,
      animalType: dto.animalTypeId,
      date: new Date(dto.date),
      quantity: dto.quantity,
      notes: dto.notes,
    });

    return created.save();
  }

  // =====================================================
  // FIND ALL
  // Trả thêm latestCalculation để FE hiển thị:
  // - Giá / con
  // - Tổng tiền
  // - Trạng thái thanh toán
  // =====================================================

  async findAll(): Promise<any[]> {
    const logs = await this.dailyLogModel
      .find()
      .populate('owner animalType')
      .sort({ date: -1 })
      .lean()
      .exec();

    if (logs.length === 0) {
      return [];
    }

    const histories = await this.historyModel
      .find()
      .sort({
        calculatedAt: -1,
        createdAt: -1,
      })
      .lean()
      .exec();

    const validDailyLogIds = new Set(logs.map((log) => log._id.toString()));

    const latestCalculationMap = new Map<string, any>();

    const paidCalculationMap = new Map<string, any>();

    for (const history of histories) {
      if (!history.dailyLog) {
        continue;
      }

      const dailyLogId = history.dailyLog.toString();

      if (!validDailyLogIds.has(dailyLogId)) {
        continue;
      }

      if (!latestCalculationMap.has(dailyLogId)) {
        latestCalculationMap.set(dailyLogId, history);
      }

      if (history.isPaid === true && !paidCalculationMap.has(dailyLogId)) {
        paidCalculationMap.set(dailyLogId, history);
      }
    }

    return logs.map((log) => {
      const dailyLogId = log._id.toString();

      const latestCalculation =
        paidCalculationMap.get(dailyLogId) ??
        latestCalculationMap.get(dailyLogId) ??
        null;

      return {
        ...log,
        latestCalculation,
      };
    });
  }
  // =====================================================
  // FIND BY ID
  // =====================================================

  async findById(id: string) {
    const log = await this.dailyLogModel
      .findById(id)
      .populate('owner animalType')
      .exec();

    if (!log) {
      throw new NotFoundException(`DailyLog with ID ${id} not found`);
    }

    return log;
  }

  // =====================================================
  // UPDATE
  // =====================================================

  async update(id: string, dto: UpdateDailyLogDto) {
    const updateData: any = {
      ...dto,
    };

    // DTO dùng ownerId / animalTypeId
    // nhưng schema dùng owner / animalType
    if (dto.ownerId) {
      updateData.owner = dto.ownerId;

      delete updateData.ownerId;
    }

    if (dto.animalTypeId) {
      updateData.animalType = dto.animalTypeId;

      delete updateData.animalTypeId;
    }

    if (dto.date) {
      updateData.date = new Date(dto.date);
    }

    const log = await this.dailyLogModel
      .findByIdAndUpdate(id, updateData, {
        returnDocument: 'after',
      })
      .populate('owner animalType')
      .exec();

    if (!log) {
      throw new NotFoundException(`DailyLog with ID ${id} not found`);
    }

    return log;
  }

  // =====================================================
  // DELETE
  // =====================================================

  async delete(id: string) {
    const log = await this.dailyLogModel.findByIdAndDelete(id);

    if (!log) {
      throw new NotFoundException(`DailyLog with ID ${id} not found`);
    }

    return log;
  }

  // =====================================================
  // MONTH SUMMARY
  // =====================================================

  async getMonthSummary(
    ownerId: string,
    animalTypeId: string,
    month: string,
  ): Promise<any> {
    const [year, mon] = month.split('-').map(Number);

    const start = new Date(year, mon - 1, 1);

    const end = new Date(year, mon, 0, 23, 59, 59, 999);

    // =====================================================
    // DAILY LOGS TRONG THÁNG
    // =====================================================

    const logs = await this.dailyLogModel
      .find({
        owner: ownerId,
        animalType: animalTypeId,
        date: {
          $gte: start,
          $lte: end,
        },
      })
      .populate('owner animalType')
      .sort({
        date: -1,
      })
      .lean()
      .exec();

    const totalQuantity = logs.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0,
    );

    if (logs.length === 0) {
      return {
        month,
        totalQuantity: 0,
        totalDays: 0,
        totalCost: 0,
        totalPaid: 0,
        totalUnpaid: 0,
        calculatedDays: 0,
        uncalculatedDays: 0,
        paidDays: 0,
        unpaidDays: 0,
        logs: [],
      };
    }

    // =====================================================
    // DAILY LOG IDS
    // =====================================================

    const validDailyLogIds = new Set(logs.map((log) => log._id.toString()));

    // =====================================================
    // HISTORIES
    //
    // Không dùng:
    // dailyLog: { $in: dailyLogIds }
    //
    // vì trước đó project đang có vấn đề match ở query này.
    // =====================================================

    const allHistories = await this.historyModel
      .find()
      .sort({
        calculatedAt: -1,
        createdAt: -1,
      })
      .lean()
      .exec();

    // Chỉ giữ history thuộc các DailyLog
    // đang nằm trong tháng hiện tại
    const histories = allHistories.filter((history: any) => {
      if (!history.dailyLog) {
        return false;
      }

      return validDailyLogIds.has(history.dailyLog.toString());
    });

    // =====================================================
    // LATEST CALCULATION CỦA MỖI DAILY LOG
    // =====================================================

    const latestHistoryByDailyLog = new Map<string, any>();

    const paidHistoryByDailyLog = new Map<string, any>();

    for (const history of histories) {
      const dailyLogId = history.dailyLog.toString();

      // histories đã sort mới nhất -> cũ
      if (!latestHistoryByDailyLog.has(dailyLogId)) {
        latestHistoryByDailyLog.set(dailyLogId, history);
      }

      // Lưu history đã thanh toán
      if (history.isPaid === true && !paidHistoryByDailyLog.has(dailyLogId)) {
        paidHistoryByDailyLog.set(dailyLogId, history);
      }
    }

    // =====================================================
    // TOTAL COST
    // =====================================================

    const totalCost = Array.from(latestHistoryByDailyLog.values()).reduce(
      (sum, history) => sum + Number(history.totalCost || 0),
      0,
    );

    const calculatedDays = latestHistoryByDailyLog.size;

    const uncalculatedDays = logs.length - calculatedDays;

    // =====================================================
    // PAID
    // =====================================================

    const totalPaid = Array.from(paidHistoryByDailyLog.values()).reduce(
      (sum, history) => sum + Number(history.totalCost || 0),
      0,
    );

    const paidDays = paidHistoryByDailyLog.size;

    const unpaidDays = Math.max(calculatedDays - paidDays, 0);

    const totalUnpaid = Math.max(totalCost - totalPaid, 0);

    // =====================================================
    // RESPONSE
    // =====================================================

    return {
      month,

      totalQuantity,

      totalDays: logs.length,

      totalCost,

      totalPaid,

      totalUnpaid,

      calculatedDays,

      uncalculatedDays,

      paidDays,

      unpaidDays,

      logs,
    };
  }
}
