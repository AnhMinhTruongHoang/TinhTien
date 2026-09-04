import { PartialType } from '@nestjs/mapped-types';

import { CreateEmployeeAbsenceDto } from './create-employee-absence.dto';

export class UpdateEmployeeAbsenceDto extends PartialType(
  CreateEmployeeAbsenceDto,
) {}
