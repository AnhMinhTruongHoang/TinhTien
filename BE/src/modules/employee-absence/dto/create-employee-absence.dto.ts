import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateEmployeeAbsenceDto {
  @IsMongoId()
  employeeId: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsNumber()
  @Min(0)
  deductionAmount: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
