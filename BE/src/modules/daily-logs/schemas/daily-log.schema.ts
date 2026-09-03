// src/modules/daily-logs/schemas/daily-log.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Owner } from 'src/modules/owners/schemas/owner.schemas';
import { AnimalType } from 'src/modules/animal-types/schemas/animal-type.schemas';

export type DailyLogDocument = DailyLog & Document;

@Schema({ timestamps: true })
export class DailyLog {
  @Prop({ type: Types.ObjectId, ref: 'Owner', required: true, index: true })
  owner: Types.ObjectId | Owner;

  @Prop({
    type: Types.ObjectId,
    ref: 'AnimalType',
    required: true,
    index: true,
  })
  animalType: Types.ObjectId | AnimalType;

  @Prop({ required: true, index: true })
  date: Date; // Ngày cụ thể (lưu full Date)

  @Prop({ required: true, min: 0 })
  quantity: number;

  @Prop()
  notes?: string;
}

export const DailyLogSchema = SchemaFactory.createForClass(DailyLog);

// Index quan trọng
DailyLogSchema.index({ owner: 1, animalType: 1, date: -1 });
DailyLogSchema.index({ date: -1 }); // sort mới nhất trước
