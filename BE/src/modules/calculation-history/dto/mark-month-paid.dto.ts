import { IsMongoId, IsNotEmpty, Matches } from 'class-validator';

export class MarkMonthPaidDto {
  @IsMongoId()
  @IsNotEmpty()
  ownerId: string;

  @IsMongoId()
  @IsNotEmpty()
  animalTypeId: string;

  @Matches(/^\d{4}-\d{2}$/, {
    message: 'month phải có định dạng YYYY-MM',
  })
  month: string;
}
