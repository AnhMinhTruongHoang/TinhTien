import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CalculateCostDto {
  @IsString()
  readonly batchId: string;

  @IsNumber()
  readonly pricePerUnit: number;

  @IsNumber()
  @IsOptional()
  readonly slaughterPricePerUnit?: number;

  @IsNumber()
  @IsOptional()
  readonly transportCost?: number;
}
