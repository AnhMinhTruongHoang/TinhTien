import { IsMongoId, IsNumber, Min } from 'class-validator';

export class CalculateCostDto {
  @IsMongoId()
  batchId: string;

  @IsNumber()
  @Min(0)
  pricePerUnit: number;
}
