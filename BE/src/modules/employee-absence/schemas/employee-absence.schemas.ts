import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document, Types } from 'mongoose';

export type EmployeeAbsenceDocument = EmployeeAbsence & Document;

@Schema({ timestamps: true })
export class EmployeeAbsence {
  @Prop({
    type: Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true,
  })
  employee: Types.ObjectId;

  @Prop({
    required: true,
    index: true,
  })
  date: Date;

  @Prop({
    required: true,
    trim: true,
  })
  reason: string;

  @Prop({
    required: true,
    min: 0,
  })
  deductionAmount: number;

  @Prop()
  notes?: string;
}

export const EmployeeAbsenceSchema =
  SchemaFactory.createForClass(EmployeeAbsence);

EmployeeAbsenceSchema.index(
  {
    employee: 1,
    date: 1,
  },
  {
    unique: true,
  },
);
