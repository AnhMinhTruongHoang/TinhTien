import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { SalaryAdvanceDocument } from './schemas/salary-advance.schemas';
import { EmployeeDocument } from '../employee/schemas/employee.schemas';
import { EmployeeAbsenceDocument } from '../employee-absence/schemas/employee-absence.schemas';
import { MonthlyPayrollDocument } from '../monthly-payrolls/schemas/monthly-payroll.schemas';
import { CreateSalaryAdvanceDto } from './dto/create-salary-advance.dto';
import { FullSalaryAdvanceDto } from './dto/full-salary-advance.dto';

@Injectable()
export class SalaryAdvancesService {
  constructor(
    @InjectModel('SalaryAdvance')
    private readonly advanceModel: Model<SalaryAdvanceDocument>,

    @InjectModel('Employee')
    private readonly employeeModel: Model<EmployeeDocument>,

    @InjectModel('EmployeeAbsence')
    private readonly absenceModel: Model<EmployeeAbsenceDocument>,

    @InjectModel('MonthlyPayroll')
    private readonly payrollModel: Model<MonthlyPayrollDocument>,
  ) {}

  // =====================================================
  // MONTH RANGE
  // =====================================================

  private getMonthRange(month: string) {
    const [year, monthNumber] = month.split('-').map(Number);

    if (!year || !monthNumber || monthNumber < 1 || monthNumber > 12) {
      throw new BadRequestException('Tháng không hợp lệ');
    }

    const start = new Date(Date.UTC(year, monthNumber - 1, 1));

    const end = new Date(Date.UTC(year, monthNumber, 1));

    return {
      year,
      monthNumber,
      start,
      end,
    };
  }

  // =====================================================
  // CHECK FINALIZED
  // =====================================================

  private async ensureNotFinalized(employeeId: string, month: string) {
    const finalized = await this.payrollModel.exists({
      employee: employeeId,

      month,
    });

    if (finalized) {
      throw new BadRequestException(
        `Lương tháng ${month} đã được chốt, không thể thay đổi tiền ứng`,
      );
    }
  }

  // =====================================================
  // SUMMARY
  // =====================================================

  async getSummary(employeeId: string, month: string) {
    const employee = await this.employeeModel
      .findById(employeeId)
      .lean()
      .exec();

    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    const { year, monthNumber, start, end } = this.getMonthRange(month);

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

    const advances = await this.advanceModel
      .find({
        employee: employeeId,

        month,
      })
      .sort({
        date: 1,
        createdAt: 1,
      })
      .lean()
      .exec();

    const totalDays = new Date(year, monthNumber, 0).getDate();

    const absenceDays = absences.length;

    const presentDays = Math.max(totalDays - absenceDays, 0);

    const baseSalary = Number(employee.baseSalary || 0);

    const totalDeduction = absences.reduce(
      (total, absence) => total + Number(absence.deductionAmount || 0),
      0,
    );

    const salaryAfterDeduction = Math.max(baseSalary - totalDeduction, 0);

    const totalAdvance = advances.reduce(
      (total, advance) => total + Number(advance.amount || 0),
      0,
    );

    const remainingSalary = Math.max(salaryAfterDeduction - totalAdvance, 0);

    const finalizedPayroll = await this.payrollModel
      .findOne({
        employee: employeeId,

        month,
      })
      .lean()
      .exec();

    return {
      month,

      employee,

      totalDays,

      presentDays,

      absenceDays,

      baseSalary,

      totalDeduction,

      salaryAfterDeduction,

      totalAdvance,

      remainingSalary,

      advances,

      isFinalized: Boolean(finalizedPayroll),

      finalizedPayroll: finalizedPayroll || null,
    };
  }

  // =====================================================
  // FIND BY EMPLOYEE + MONTH
  // =====================================================

  async findByEmployeeMonth(employeeId: string, month: string) {
    return this.advanceModel
      .find({
        employee: employeeId,

        month,
      })
      .sort({
        date: -1,
        createdAt: -1,
      })
      .lean()
      .exec();
  }

  // =====================================================
  // CREATE PARTIAL ADVANCE
  // =====================================================

  async create(dto: CreateSalaryAdvanceDto) {
    await this.ensureNotFinalized(dto.employeeId, dto.month);

    const summary = await this.getSummary(dto.employeeId, dto.month);

    const amount = Number(dto.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Số tiền ứng phải lớn hơn 0');
    }

    if (amount > summary.remainingSalary) {
      throw new BadRequestException(
        `Không thể ứng vượt số tiền còn lại ${Number(
          summary.remainingSalary,
        ).toLocaleString('vi-VN')}đ`,
      );
    }

    const advance = new this.advanceModel({
      employee: dto.employeeId,

      month: dto.month,

      amount,

      date: new Date(`${dto.date}T00:00:00.000Z`),

      note: dto.note?.trim() || undefined,
    });

    const saved = await advance.save();

    const newSummary = await this.getSummary(dto.employeeId, dto.month);

    return {
      advance: saved,

      summary: newSummary,

      message: `Đã ứng ${amount.toLocaleString('vi-VN')}đ`,
    };
  }

  // =====================================================
  // FULL ADVANCE
  // =====================================================

  async createFullAdvance(dto: FullSalaryAdvanceDto) {
    await this.ensureNotFinalized(dto.employeeId, dto.month);

    const summary = await this.getSummary(dto.employeeId, dto.month);

    const amount = Number(summary.remainingSalary || 0);

    if (amount <= 0) {
      throw new BadRequestException('Nhân viên không còn lương để ứng');
    }

    const advance = new this.advanceModel({
      employee: dto.employeeId,

      month: dto.month,

      amount,

      date: new Date(`${dto.date}T00:00:00.000Z`),

      note: dto.note?.trim() || 'Ứng toàn bộ phần lương còn lại',
    });

    const saved = await advance.save();

    const newSummary = await this.getSummary(dto.employeeId, dto.month);

    return {
      advance: saved,

      summary: newSummary,

      message: `Đã ứng toàn bộ ${amount.toLocaleString('vi-VN')}đ`,
    };
  }

  // =====================================================
  // DELETE
  // =====================================================

  async delete(id: string) {
    const advance = await this.advanceModel.findById(id).exec();

    if (!advance) {
      throw new NotFoundException('Không tìm thấy lần ứng lương');
    }

    await this.ensureNotFinalized(advance.employee.toString(), advance.month);

    await advance.deleteOne();

    return {
      message: 'Đã xóa lần ứng lương',
    };
  }
}
