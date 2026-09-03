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

  async findAll() {
    // ================= DAILY LOGS =================
    const logs = await this.dailyLogModel
      .find()
      .populate('owner animalType')
      .sort({ date: -1 })
      .lean()
      .exec();

    if (logs.length === 0) {
      return [];
    }

    // ================= HISTORIES =================
    // Lấy history mới nhất trước
    const histories = await this.historyModel
      .find()
      .sort({
        calculatedAt: -1,
        createdAt: -1,
      })
      .lean()
      .exec();

    // Danh sách DailyLog đang tồn tại
    const validDailyLogIds = new Set(logs.map((log) => log._id.toString()));

    const latestCalculationMap = new Map<string, any>();
    const paidCalculationMap = new Map<string, any>();

    for (const history of histories) {
      if (!history.dailyLog) {
        continue;
      }

      const dailyLogId = history.dailyLog.toString();

      // History không thuộc DailyLog hiện tại thì bỏ qua
      if (!validDailyLogIds.has(dailyLogId)) {
        continue;
      }

      // Vì histories sort mới nhất -> cũ
      // nên cái đầu tiên là lần tính mới nhất
      if (!latestCalculationMap.has(dailyLogId)) {
        latestCalculationMap.set(dailyLogId, history);
      }

      // Nếu đã thanh toán thì lưu history paid
      if (history.isPaid === true && !paidCalculationMap.has(dailyLogId)) {
        paidCalculationMap.set(dailyLogId, history);
      }
    }

    // ================= RESPONSE =================
    return logs.map((log) => {
      const dailyLogId = log._id.toString();

      // Nếu đã paid -> ưu tiên history đã paid.
      // Nếu chưa -> lấy calculation mới nhất.
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

  async getMonthSummary(ownerId: string, animalTypeId: string, month: string) {
    const [year, mon] = month.split('-').map(Number);

    const start = new Date(year, mon - 1, 1);

    const end = new Date(year, mon, 0, 23, 59, 59, 999);

    // =====================================================
    // DAILY LOGS
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
      .exec();

    // Tổng số con trong tháng
    const totalQuantity = logs.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0,
    );

    // =====================================================
    // CALCULATION HISTORY
    // =====================================================

    const dailyLogIds = logs.map((log) => log._id);

    const histories = await this.historyModel
      .find({
        dailyLog: {
          $in: dailyLogIds,
        },
      })
      .sort({
        calculatedAt: -1,
      })
      .exec();

    // =====================================================
    // LATEST HISTORY CỦA MỖI DAILY LOG
    // =====================================================

    const latestHistoryByDailyLog = new Map<
      string,
      CalculationHistoryDocument
    >();

    for (const history of histories) {
      const dailyLogId = history.dailyLog.toString();

      // histories đã sort DESC
      // nên record đầu tiên là lần tính mới nhất
      if (!latestHistoryByDailyLog.has(dailyLogId)) {
        latestHistoryByDailyLog.set(dailyLogId, history);
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

    const paidHistoryByDailyLog = new Map<string, CalculationHistoryDocument>();

    for (const history of histories) {
      if (!history.isPaid) {
        continue;
      }

      const dailyLogId = history.dailyLog.toString();

      if (!paidHistoryByDailyLog.has(dailyLogId)) {
        paidHistoryByDailyLog.set(dailyLogId, history);
      }
    }

    // Tổng tiền đã nhận
    const totalPaid = Array.from(paidHistoryByDailyLog.values()).reduce(
      (sum, history) => sum + Number(history.totalCost || 0),
      0,
    );

    const paidDays = paidHistoryByDailyLog.size;

    // Có tính giá nhưng chưa nhận tiền
    const unpaidDays = calculatedDays - paidDays;

    // Tổng tiền chưa nhận
    const totalUnpaid = Math.max(totalCost - totalPaid, 0);

    // =====================================================
    // RESPONSE
    // =====================================================

    return {
      month,

      // Tổng số con
      totalQuantity,

      // Tổng số ngày có log
      totalDays: logs.length,

      // Tổng tiền đã tính
      totalCost,

      // Tổng tiền đã nhận
      totalPaid,

      // Tổng tiền chưa nhận
      totalUnpaid,

      // Số ngày đã tính giá
      calculatedDays,

      // Số ngày chưa tính giá
      uncalculatedDays,

      // Số ngày đã nhận tiền
      paidDays,

      // Số ngày tính rồi nhưng chưa nhận tiền
      unpaidDays,

      logs,
    };
  }
}
