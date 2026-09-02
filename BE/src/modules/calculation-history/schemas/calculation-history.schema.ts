import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Batch } from 'src/modules/batch/schemas/batch.schemas';

export type CalculationHistoryDocument = CalculationHistory & Document;

@Schema({ timestamps: true })
export class CalculationHistory {
  @Prop({ type: Types.ObjectId, ref: 'Batch', required: true, index: true })
  batch: Types.ObjectId | Batch;

  // Input người dùng nhập
  @Prop({ required: true })
  pricePerUnit: number;

  @Prop({ default: 0 })
  slaughterPricePerUnit: number;

  @Prop({ default: 0 })
  transportCost: number;

  // Snapshot dữ liệu batch tại thời điểm tính (tránh batch bị sửa sau này làm sai lịch sử)
  @Prop({ required: true })
  quantity: number;

  @Prop({ default: 0 })
  quantityNotSlaughtered: number;

  @Prop({ required: true })
  slaughterQuantity: number;

  // Kết quả tính toán
  @Prop({ required: true })
  animalCost: number;

  @Prop({ required: true })
  slaughterCost: number;

  @Prop({ required: true })
  totalCost: number;

  @Prop({ required: true })
  costPerUnit: number;

  // Thời gian tính (có thể dùng timestamps.createdAt, nhưng giữ thêm cho rõ)
  @Prop({ default: Date.now })
  calculatedAt: Date;

  // Nếu sau này có User thì thêm field này
  // @Prop({ type: Types.ObjectId, ref: 'User' })
  // calculatedBy?: Types.ObjectId;
}

export const CalculationHistorySchema =
  SchemaFactory.createForClass(CalculationHistory);

// Index để query nhanh theo batch
CalculationHistorySchema.index({ batch: 1, calculatedAt: -1 });
