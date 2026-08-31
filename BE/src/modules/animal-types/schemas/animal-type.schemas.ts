import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AnimalTypeDocument = AnimalType & Document;

@Schema()
export class AnimalType {
  @Prop({ required: true })
  name: string;

  @Prop()
  unit?: string; // e.g., 'con', 'cái'

  @Prop()
  description?: string;
}

export const AnimalTypeSchema = SchemaFactory.createForClass(AnimalType);
