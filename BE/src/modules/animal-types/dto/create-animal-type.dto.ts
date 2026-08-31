import { IsString, IsOptional } from 'class-validator';

export class CreateAnimalTypeDto {
  @IsString()
  readonly name: string;

  @IsString()
  @IsOptional()
  readonly unit?: string;

  @IsString()
  @IsOptional()
  readonly description?: string;
}
