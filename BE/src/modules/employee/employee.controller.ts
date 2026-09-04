import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { CreateEmployeeDto } from './dto/create-employee.dto';

import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesService } from './employee.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  create(
    @Body()
    dto: CreateEmployeeDto,
  ) {
    return this.employeesService.create(dto);
  }

  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  findById(
    @Param('id')
    id: string,
  ) {
    return this.employeesService.findById(id);
  }

  @Put(':id')
  update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, dto);
  }

  @Delete(':id')
  delete(
    @Param('id')
    id: string,
  ) {
    return this.employeesService.delete(id);
  }
}
