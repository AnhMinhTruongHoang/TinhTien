import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmployeeDocument = Employee & Document;

@Schema({ timestamps: true })
export class Employee {
  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    trim: true,
  })
  phone?: string;

  @Prop({
    trim: true,
  })
  address?: string;

  @Prop({
    required: true,
    min: 0,
    default: 0,
  })
  baseSalary: number;

  @Prop({
    default: true,
    index: true,
  })
  isActive: boolean;

  @Prop()
  notes?: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
