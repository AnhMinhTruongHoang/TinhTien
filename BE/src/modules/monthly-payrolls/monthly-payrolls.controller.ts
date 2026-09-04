import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { MonthlyPayrollsService } from './monthly-payrolls.service';

import { FinalizePayrollDto } from './dto/finalize-payroll.dto';

@Controller('monthly-payrolls')
export class MonthlyPayrollsController {
  constructor(private readonly service: MonthlyPayrollsService) {}

  @Post('finalize')
  finalize(
    @Body()
    dto: FinalizePayrollDto,
  ) {
    return this.service.finalize(dto);
  }

  @Get()
  findOne(
    @Query('employeeId')
    employeeId: string,

    @Query('month')
    month: string,
  ) {
    return this.service.findByEmployeeMonth(employeeId, month);
  }

  @Get('month')
  findMonth(
    @Query('month')
    month: string,
  ) {
    return this.service.findByMonth(month);
  }
}
