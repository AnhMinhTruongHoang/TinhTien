import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateBatchDto {
  @IsString()
  readonly ownerId: string;

  @IsString()
  @IsOptional()
  readonly originAddress?: string;

  @IsString()
  @IsOptional()
  readonly destinationAddress?: string;

  @IsString()
  readonly animalTypeId: string;

  @IsNumber()
  readonly quantity: number;

  @IsNumber()
  @IsOptional()
  readonly quantityNotSlaughtered?: number;

  @IsOptional()
  @IsString()
  readonly notes?: string;

  @IsOptional()
  @IsDateString()
  readonly recordDate?: string;
}
