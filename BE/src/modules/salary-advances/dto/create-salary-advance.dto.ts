import {
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateSalaryAdvanceDto {
  @IsMongoId()
  employeeId: string;

  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'month phải có định dạng YYYY-MM',
  })
  month: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  note?: string;
}
