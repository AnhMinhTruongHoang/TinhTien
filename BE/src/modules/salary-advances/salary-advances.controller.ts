import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { SalaryAdvancesService } from './salary-advances.service';

import { CreateSalaryAdvanceDto } from './dto/create-salary-advance.dto';

import { FullSalaryAdvanceDto } from './dto/full-salary-advance.dto';

@Controller('salary-advances')
export class SalaryAdvancesController {
  constructor(private readonly service: SalaryAdvancesService) {}

  // =====================================================
  // SUMMARY
  // =====================================================

  @Get('summary')
  summary(
    @Query('employeeId')
    employeeId: string,

    @Query('month')
    month: string,
  ) {
    return this.service.getSummary(employeeId, month);
  }

  // =====================================================
  // GET HISTORY
  // =====================================================

  @Get()
  findAll(
    @Query('employeeId')
    employeeId: string,

    @Query('month')
    month: string,
  ) {
    return this.service.findByEmployeeMonth(employeeId, month);
  }

  // =====================================================
  // PARTIAL ADVANCE
  // =====================================================

  @Post()
  create(
    @Body()
    dto: CreateSalaryAdvanceDto,
  ) {
    return this.service.create(dto);
  }

  // =====================================================
  // FULL ADVANCE
  // =====================================================

  @Post('full')
  createFull(
    @Body()
    dto: FullSalaryAdvanceDto,
  ) {
    return this.service.createFullAdvance(dto);
  }

  // =====================================================
  // DELETE
  // =====================================================

  @Delete(':id')
  delete(
    @Param('id')
    id: string,
  ) {
    return this.service.delete(id);
  }
}
