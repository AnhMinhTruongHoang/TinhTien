import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum DebtType {
  DEBT = 'DEBT',
  PAYMENT = 'PAYMENT',
}

export enum DebtStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export type DebtDocument = Debt & Document;

@Schema({ timestamps: true })
export class Debt {
  @Prop({
    type: Types.ObjectId,
    ref: 'Owner',
    required: true,
    index: true,
  })
  owner: Types.ObjectId;

  @Prop({
    type: String,
    enum: DebtType,
    required: true,
    index: true,
  })
  type: DebtType;

  @Prop({
    type: Number,
    required: true,
    min: 0,
    index: true,
  })
  amount: number;

  @Prop({
    type: Date,
    required: true,
    index: true,
  })
  date: Date;

  @Prop({
    type: String,
    trim: true,
    maxlength: 500,
    default: '',
  })
  note: string;

  @Prop({
    type: String,
    enum: DebtStatus,
    default: DebtStatus.ACTIVE,
    index: true,
  })
  status: DebtStatus;

  @Prop({
    type: String,
    trim: true,
    default: '',
  })
  createdBy?: string;

  @Prop({
    type: String,
    trim: true,
    default: '',
  })
  updatedBy?: string;
}

export const DebtSchema = SchemaFactory.createForClass(Debt);

DebtSchema.index({ owner: 1, date: -1, status: 1 });
DebtSchema.index({ owner: 1, type: 1, status: 1 });
DebtSchema.index({ date: -1, status: 1 });
DebtSchema.index({ note: 'text' });
