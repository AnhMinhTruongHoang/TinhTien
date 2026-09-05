import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { MongoServerError } from 'mongodb';
import { FinalizePayrollDto } from './dto/finalize-payroll.dto';
import { MonthlyPayrollDocument } from './schemas/monthly-payroll.schemas';
import { EmployeeDocument } from '../employee/schemas/employee.schemas';
import { EmployeeAbsenceDocument } from '../employee-absence/schemas/employee-absence.schemas';
import { SalaryAdvanceDocument } from '../salary-advances/schemas/salary-advance.schemas';

@Injectable()
export class MonthlyPayrollsService {
  constructor(
    @InjectModel('MonthlyPayroll')
    private readonly payrollModel: Model<MonthlyPayrollDocument>,

    @InjectModel('Employee')
    private readonly employeeModel: Model<EmployeeDocument>,

    @InjectModel('EmployeeAbsence')
    private readonly absenceModel: Model<EmployeeAbsenceDocument>,

    @InjectModel('SalaryAdvance')
    private readonly advanceModel: Model<SalaryAdvanceDocument>,
  ) {}

  async findByEmployeeMonth(employeeId: string, month: string) {
    return this.payrollModel
      .findOne({
        employee: employeeId,
        month,
      })
      .lean()
      .exec();
  }

  async isFinalized(employeeId: string, month: string): Promise<boolean> {
    const exists = await this.payrollModel.exists({
      employee: employeeId,
      month,
    });

    return Boolean(exists);
  }

  async finalize(dto: FinalizePayrollDto) {
    // =====================================================
    // CHECK ĐÃ CHỐT
    // =====================================================

    const existing = await this.findByEmployeeMonth(dto.employeeId, dto.month);

    if (existing) {
      return existing;
    }

    // =====================================================
    // EMPLOYEE
    // =====================================================

    const employee = await this.employeeModel
      .findById(dto.employeeId)
      .lean()
      .exec();

    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    // =====================================================
    // MONTH RANGE
    // =====================================================

    const [year, monthNumber] = dto.month.split('-').map(Number);

    const startDate = new Date(Date.UTC(year, monthNumber - 1, 1));

    const endDate = new Date(Date.UTC(year, monthNumber, 1));

    // =====================================================
    // ABSENCES
    // =====================================================

    const absences = await this.absenceModel
      .find({
        employee: dto.employeeId,

        date: {
          $gte: startDate,
          $lt: endDate,
        },
      })
      .sort({
        date: 1,
      })
      .lean()
      .exec();

    // =====================================================
    // SALARY ADVANCES
    // =====================================================

    const advances = await this.advanceModel
      .find({
        employee: dto.employeeId,
        month: dto.month,
      })
      .sort({
        date: 1,
        createdAt: 1,
      })
      .lean()
      .exec();

    // =====================================================
    // CALCULATE
    // =====================================================

    const totalDays = new Date(year, monthNumber, 0).getDate();

    const absenceDays = absences.length;

    const presentDays = Math.max(totalDays - absenceDays, 0);

    const totalDeduction = absences.reduce(
      (total, item) => total + Number(item.deductionAmount || 0),
      0,
    );

    const baseSalary = Number(employee.baseSalary || 0);

    const salaryAfterDeduction = Math.max(baseSalary - totalDeduction, 0);

    // Giữ tương thích field cũ
    const finalSalary = salaryAfterDeduction;

    const totalAdvance = advances.reduce(
      (total, advance) => total + Number(advance.amount || 0),
      0,
    );

    // =====================================================
    // CHECK ỨNG VƯỢT LƯƠNG
    // =====================================================

    if (totalAdvance > salaryAfterDeduction) {
      throw new BadRequestException(
        `Nhân viên đã ứng ${totalAdvance.toLocaleString(
          'vi-VN',
        )}đ, vượt lương sau khấu trừ ${salaryAfterDeduction.toLocaleString(
          'vi-VN',
        )}đ. Vui lòng kiểm tra lại trước khi chốt lương.`,
      );
    }

    const remainingSalary = salaryAfterDeduction - totalAdvance;

    // =====================================================
    // SNAPSHOT
    // =====================================================

    const payroll = new this.payrollModel({
      employee: employee._id,

      employeeName: employee.name,

      month: dto.month,

      baseSalary,

      totalDays,

      presentDays,

      absenceDays,

      totalDeduction,

      finalSalary,

      salaryAfterDeduction,

      totalAdvance,

      remainingSalary,

      absences: absences.map((item) => ({
        date: item.date,

        reason: item.reason,

        deductionAmount: Number(item.deductionAmount || 0),

        notes: item.notes,
      })),

      advances: advances.map((item: any) => ({
        amount: Number(item.amount || 0),

        // Hỗ trợ dữ liệu cũ nếu thiếu date
        date: item.date || item.createdAt || startDate,

        note: item.note,
      })),

      finalizedAt: new Date(),
    });

    // =====================================================
    // SAVE
    // =====================================================

    try {
      return await payroll.save();
    } catch (error: any) {
      // ===================================================
      // UNIQUE employee + month
      //
      // Có thể xảy ra khi user click 2 lần rất nhanh:
      // request A và B cùng vượt qua existing check.
      // A save thành công.
      // B bị E11000.
      // ===================================================

      if (error?.code === 11000) {
        const finalizedPayroll = await this.findByEmployeeMonth(
          dto.employeeId,
          dto.month,
        );

        if (finalizedPayroll) {
          return finalizedPayroll;
        }

        throw new BadRequestException('Bảng lương tháng này đã được chốt');
      }

      console.error('PAYROLL SAVE ERROR:', error);

      throw new BadRequestException(
        error instanceof Error
          ? `Không thể chốt lương: ${error.message}`
          : 'Không thể chốt lương tháng',
      );
    }
  }

  async findByMonth(month: string) {
    return this.payrollModel
      .find({
        month,
      })
      .populate('employee')
      .sort({
        employeeName: 1,
      })
      .lean()
      .exec();
  }
}
