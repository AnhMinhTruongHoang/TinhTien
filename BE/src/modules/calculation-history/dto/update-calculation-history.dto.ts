import { PartialType } from '@nestjs/mapped-types';
import { CreateCalculationHistoryDto } from './create-calculation-history.dto';

export class UpdateCalculationDto extends PartialType(
  CreateCalculationHistoryDto,
) {}
