import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CalculationHistoryDocument = CalculationHistory & Document;

@Schema({ timestamps: true })
export class CalculationHistory {
  @Prop({
    type: Types.ObjectId,
    ref: 'DailyLog',
    required: true,
    index: true,
  })
  dailyLog: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Owner',
    required: true,
  })
  owner: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'AnimalType',
    required: true,
  })
  animalType: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  pricePerUnit: number;

  @Prop({ required: true })
  totalCost: number;

  @Prop({ default: Date.now })
  calculatedAt: Date;

  // ================= PAYMENT =================

  @Prop({ default: false, index: true })
  isPaid: boolean;

  @Prop()
  paidAt?: Date;
}

export const CalculationHistorySchema =
  SchemaFactory.createForClass(CalculationHistory);

CalculationHistorySchema.index({ dailyLog: 1, calculatedAt: -1 });
CalculationHistorySchema.index({ owner: 1, animalType: 1, date: -1 });
