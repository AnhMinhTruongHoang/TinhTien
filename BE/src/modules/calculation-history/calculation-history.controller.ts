import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';
import { CalculationHistoryService } from './calculation-history.service';
import { CreateCalculationHistoryDto } from './dto/create-calculation-history.dto';

@Controller('calculation-history')
export class CalculationHistoryController {
  constructor(private readonly service: CalculationHistoryService) {}

  @Post()
  create(@Body() dto: CreateCalculationHistoryDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('batch/:batchId')
  findByBatch(@Param('batchId') batchId: string) {
    return this.service.findByBatch(batchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
