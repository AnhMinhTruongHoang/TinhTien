import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { CreateEmployeeAbsenceDto } from './dto/create-employee-absence.dto';
import { UpdateEmployeeAbsenceDto } from './dto/update-employee-absence.dto';
import { EmployeeAbsencesService } from './employee-absence.service';

@Controller('employee-absences')
export class EmployeeAbsencesController {
  constructor(private readonly service: EmployeeAbsencesService) {}

  @Post()
  create(
    @Body()
    dto: CreateEmployeeAbsenceDto,
  ) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('employeeId')
    employeeId?: string,
  ) {
    return this.service.findAll(employeeId);
  }

  @Get('month-summary')
  monthSummary(
    @Query('employeeId')
    employeeId: string,

    @Query('month')
    month: string,
  ) {
    return this.service.getMonthSummary(employeeId, month);
  }

  @Put(':id')
  update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdateEmployeeAbsenceDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(
    @Param('id')
    id: string,
  ) {
    return this.service.delete(id);
  }
}
