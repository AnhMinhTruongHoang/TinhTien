import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document, Types } from 'mongoose';

export type MonthlyPayrollDocument = MonthlyPayroll & Document;

@Schema({ _id: false })
export class PayrollAdvanceSnapshot {
  @Prop({
    required: true,
  })
  amount: number;

  @Prop({
    required: true,
  })
  date: Date;

  @Prop()
  note?: string;
}

const PayrollAdvanceSnapshotSchema = SchemaFactory.createForClass(
  PayrollAdvanceSnapshot,
);

@Schema({ _id: false })
export class PayrollAbsenceSnapshot {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  reason: string;

  @Prop({
    required: true,
    min: 0,
  })
  deductionAmount: number;

  @Prop()
  notes?: string;
}

const PayrollAbsenceSnapshotSchema = SchemaFactory.createForClass(
  PayrollAbsenceSnapshot,
);

@Schema({ timestamps: true })
export class MonthlyPayroll {
  @Prop({
    type: Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true,
  })
  employee: Types.ObjectId;

  // snapshot tên nhân viên
  @Prop({
    required: true,
  })
  employeeName: string;

  // YYYY-MM
  @Prop({
    required: true,
    index: true,
  })
  month: string;

  @Prop({
    required: true,
    min: 0,
  })
  baseSalary: number;

  @Prop({
    required: true,
  })
  totalDays: number;

  @Prop({
    required: true,
  })
  presentDays: number;

  @Prop({
    required: true,
  })
  absenceDays: number;

  @Prop({
    required: true,
    min: 0,
  })
  totalDeduction: number;

  @Prop({
    required: true,
    min: 0,
  })
  finalSalary: number;

  @Prop({
    type: [PayrollAbsenceSnapshotSchema],
    default: [],
  })
  absences: PayrollAbsenceSnapshot[];

  @Prop({
    default: Date.now,
  })
  finalizedAt: Date;

  @Prop({
    required: true,
    min: 0,
    default: 0,
  })
  salaryAfterDeduction: number;

  @Prop({
    required: true,
    min: 0,
    default: 0,
  })
  totalAdvance: number;

  @Prop({
    required: true,
    min: 0,
    default: 0,
  })
  remainingSalary: number;

  @Prop({
    type: [PayrollAdvanceSnapshotSchema],
    default: [],
  })
  advances: PayrollAdvanceSnapshot[];
}

export const MonthlyPayrollSchema =
  SchemaFactory.createForClass(MonthlyPayroll);

MonthlyPayrollSchema.index(
  {
    employee: 1,
    month: 1,
  },
  {
    unique: true,
  },
);
