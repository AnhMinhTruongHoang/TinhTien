import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { DailyLogsService } from './daily-logs.service';
import { CreateDailyLogDto } from './dto/create-daily-log.dto';
import { UpdateDailyLogDto } from './dto/update-daily-log.dto';

@Controller('daily-logs')
export class DailyLogsController {
  constructor(private readonly dailyLogsService: DailyLogsService) {}

  @Post()
  create(@Body() dto: CreateDailyLogDto) {
    return this.dailyLogsService.create(dto);
  }

  @Get()
  findAll() {
    return this.dailyLogsService.findAll();
  }

  @Get('month-summary')
  getMonthSummary(
    @Query('ownerId') ownerId: string,
    @Query('animalTypeId') animalTypeId: string,
    @Query('month') month: string,
  ) {
    return this.dailyLogsService.getMonthSummary(ownerId, animalTypeId, month);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dailyLogsService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDailyLogDto) {
    return this.dailyLogsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dailyLogsService.delete(id);
  }
}
