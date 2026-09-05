import { IsMongoId, IsNumber, Min } from 'class-validator';

import { Type } from 'class-transformer';

export class CreateCalculationHistoryDto {
  @IsMongoId()
  dailyLogId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pricePerUnit: number;
}
