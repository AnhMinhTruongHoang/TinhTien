import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
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

  // Chuẩn hóa: dùng dailyLog thay vì batch
  @Get('daily/:dailyLogId')
  findByDailyLog(@Param('dailyLogId') dailyLogId: string) {
    return this.service.findByDailyLog(dailyLogId);
  }

  @Get('month/:month')
  findByMonth(@Param('month') month: string) {
    return this.service.findByMonth(month);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Put(':id/paid')
  markAsPaid(@Param('id') id: string) {
    return this.service.markAsPaid(id);
  }
}
