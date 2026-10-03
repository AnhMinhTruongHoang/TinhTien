import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DebtType } from '../schema/debt.schema';

export class CreateDebtDto {
  @IsMongoId()
  ownerId: string;

  @IsEnum(DebtType)
  type: DebtType;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  note?: string;
}
