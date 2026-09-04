import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

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
    const existing = await this.findByEmployeeMonth(dto.employeeId, dto.month);

    if (existing) {
      throw new BadRequestException('Bảng lương tháng này đã được chốt');
    }

    const employee = await this.employeeModel
      .findById(dto.employeeId)
      .lean()
      .exec();

    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    const [year, monthNumber] = dto.month.split('-').map(Number);

    const startDate = new Date(Date.UTC(year, monthNumber - 1, 1));

    const endDate = new Date(Date.UTC(year, monthNumber, 1));

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

    const totalDays = new Date(year, monthNumber, 0).getDate();

    const absenceDays = absences.length;

    const presentDays = Math.max(totalDays - absenceDays, 0);

    const totalDeduction = absences.reduce(
      (total, item) => total + Number(item.deductionAmount || 0),
      0,
    );

    const baseSalary = Number(employee.baseSalary || 0);

    const salaryAfterDeduction = Math.max(baseSalary - totalDeduction, 0);

    // Giữ tương thích với field cũ
    const finalSalary = salaryAfterDeduction;

    const totalAdvance = advances.reduce(
      (total, advance) => total + Number(advance.amount || 0),
      0,
    );

    // Không cho chốt nếu đã ứng vượt lương
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

        deductionAmount: item.deductionAmount,

        notes: item.notes,
      })),

      advances: advances.map((item) => ({
        amount: item.amount,

        date: item.date,

        note: item.note,
      })),

      finalizedAt: new Date(),
    });

    return payroll.save();
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
