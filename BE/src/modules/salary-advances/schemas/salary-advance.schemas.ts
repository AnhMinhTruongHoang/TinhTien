import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document, Types } from 'mongoose';

export type SalaryAdvanceDocument = SalaryAdvance & Document;

@Schema({ timestamps: true })
export class SalaryAdvance {
  @Prop({
    type: Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true,
  })
  employee: Types.ObjectId;

  // YYYY-MM
  @Prop({
    required: true,
    index: true,
  })
  month: string;

  @Prop({
    required: true,
    min: 1,
  })
  amount: number;

  @Prop({
    required: true,
    index: true,
  })
  date: Date;

  @Prop({
    trim: true,
  })
  note?: string;
}

export const SalaryAdvanceSchema = SchemaFactory.createForClass(SalaryAdvance);

SalaryAdvanceSchema.index({
  employee: 1,
  month: 1,
  date: -1,
});
