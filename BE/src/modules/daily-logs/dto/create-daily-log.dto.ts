import {
  IsDateString,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

export class CreateDailyLogDto {
  @IsMongoId()
  ownerId: string;

  @IsMongoId()
  animalTypeId: string;

  @IsDateString()
  date: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
