import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AnimalType } from 'src/modules/animal-types/schemas/animal-type.schemas';
import { Owner } from 'src/modules/owners/schemas/owner.schemas';

export type BatchDocument = Batch & Document;

@Schema({ timestamps: true })
export class Batch {
  @Prop({ type: Types.ObjectId, ref: 'Owner' })
  owner: Types.ObjectId | Owner;

  @Prop()
  originAddress?: string;

  @Prop()
  destinationAddress?: string;

  @Prop({ type: Types.ObjectId, ref: 'AnimalType' })
  animalType: Types.ObjectId | AnimalType;

  @Prop({ required: true, default: 0 })
  quantity: number;

  @Prop({ default: 0 })
  quantityNotSlaughtered: number;

  @Prop()
  recordDate?: Date;

  @Prop()
  notes?: string;
}

export const BatchSchema = SchemaFactory.createForClass(Batch);
