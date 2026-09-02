import { IsMongoId, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateCalculationHistoryDto {
  @IsMongoId()
  batchId: string;

  @IsNumber()
  @Min(0)
  pricePerUnit: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  slaughterPricePerUnit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  transportCost?: number;
}
