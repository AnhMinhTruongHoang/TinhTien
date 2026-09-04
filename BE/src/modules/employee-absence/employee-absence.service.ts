import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { CreateEmployeeAbsenceDto } from './dto/create-employee-absence.dto';

import { UpdateEmployeeAbsenceDto } from './dto/update-employee-absence.dto';
import { EmployeeAbsenceDocument } from './schemas/employee-absence.schemas';
import { EmployeeDocument } from '../employee/schemas/employee.schemas';
import { MonthlyPayrollsService } from '../monthly-payrolls/monthly-payrolls.service';

@Injectable()
export class EmployeeAbsencesService {
  constructor(
    @InjectModel('EmployeeAbsence')
    private readonly absenceModel: Model<EmployeeAbsenceDocument>,

    @InjectModel('Employee')
    private readonly employeeModel: Model<EmployeeDocument>,

    private readonly monthlyPayrollsService: MonthlyPayrollsService,
  ) {}

  private normalizeDate(date: string) {
    return new Date(`${date}T00:00:00.000Z`);
  }

  async create(dto: CreateEmployeeAbsenceDto) {
    const employee = await this.employeeModel.findById(dto.employeeId);

    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    const date = this.normalizeDate(dto.date);

    await this.ensureMonthNotFinalized(dto.employeeId, date);

    const exists = await this.absenceModel.findOne({
      employee: dto.employeeId,
      date,
    });

    if (exists) {
      throw new BadRequestException(
        'Nhân viên đã được đánh dấu nghỉ trong ngày này',
      );
    }

    return new this.absenceModel({
      employee: dto.employeeId,

      date,

      reason: dto.reason,

      deductionAmount: dto.deductionAmount,

      notes: dto.notes,
    }).save();
  }

  async findAll(employeeId?: string) {
    const filter: any = {};

    if (employeeId) {
      filter.employee = employeeId;
    }

    return this.absenceModel
      .find(filter)
      .populate('employee')
      .sort({
        date: -1,
      })
      .lean()
      .exec();
  }

  async update(id: string, dto: UpdateEmployeeAbsenceDto) {
    const oldAbsence = await this.absenceModel.findById(id).exec();

    if (!oldAbsence) {
      throw new NotFoundException('Không tìm thấy ngày nghỉ');
    }

    await this.ensureMonthNotFinalized(
      oldAbsence.employee.toString(),
      oldAbsence.date,
    );

    const updateData: any = {
      ...dto,
    };

    if (dto.employeeId) {
      updateData.employee = dto.employeeId;

      delete updateData.employeeId;
    }

    if (dto.date) {
      updateData.date = this.normalizeDate(dto.date);
    }

    const absence = await this.absenceModel
      .findByIdAndUpdate(id, updateData, {
        returnDocument: 'after',
      })
      .populate('employee')
      .exec();

    if (!absence) {
      throw new NotFoundException('Không tìm thấy ngày nghỉ');
    }

    return absence;
  }

  async delete(id: string) {
    const absence = await this.absenceModel.findById(id).exec();

    if (!absence) {
      throw new NotFoundException('Không tìm thấy ngày nghỉ');
    }

    await this.ensureMonthNotFinalized(
      absence.employee.toString(),
      absence.date,
    );

    await absence.deleteOne();

    return {
      message: 'Đã xóa ngày nghỉ',
    };
  }

  // =====================================================
  // MONTH SUMMARY
  // =====================================================

  async getMonthSummary(employeeId: string, month: string) {
    const employee = await this.employeeModel.findById(employeeId).lean();

    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    const [year, mon] = month.split('-').map(Number);

    const start = new Date(Date.UTC(year, mon - 1, 1));

    const end = new Date(Date.UTC(year, mon, 1));

    const absences = await this.absenceModel
      .find({
        employee: employeeId,

        date: {
          $gte: start,
          $lt: end,
        },
      })
      .sort({
        date: 1,
      })
      .lean()
      .exec();

    const totalDays = new Date(year, mon, 0).getDate();

    const absenceDays = absences.length;

    const presentDays = Math.max(totalDays - absenceDays, 0);

    const totalDeduction = absences.reduce(
      (sum, item) => sum + Number(item.deductionAmount || 0),
      0,
    );

    const baseSalary = Number(employee.baseSalary || 0);

    const finalSalary = Math.max(baseSalary - totalDeduction, 0);

    return {
      month,

      employee,

      totalDays,

      presentDays,

      absenceDays,

      baseSalary,

      totalDeduction,

      finalSalary,

      absences,
    };
  }
  ///helper
  private getMonthFromDate(date: Date) {
    const year = date.getUTCFullYear();

    const month = String(date.getUTCMonth() + 1).padStart(2, '0');

    return `${year}-${month}`;
  }

  private async ensureMonthNotFinalized(employeeId: string, date: Date) {
    const month = this.getMonthFromDate(date);

    const finalized = await this.monthlyPayrollsService.isFinalized(
      employeeId,
      month,
    );

    if (finalized) {
      throw new BadRequestException(
        `Lương tháng ${month} đã được chốt, không thể thay đổi ngày nghỉ`,
      );
    }
  }
  ///
}
