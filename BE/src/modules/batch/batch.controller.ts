import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { CalculateCostDto } from './dto/calculate-cost.dto';
import { BatchesService } from './batch.service';

@Controller('batches')
export class BatchesController {
  constructor(private readonly service: BatchesService) {}

  @Post()
  create(@Body() dto: CreateBatchDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBatchDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Post('calculate-cost')
  calculateCost(@Body() dto: CalculateCostDto) {
    return this.service.calculateCost(dto);
  }

  @Get('owner/:ownerId')
  getBatchesByOwner(@Param('ownerId') ownerId: string) {
    return this.service.getBatchesByOwner(ownerId);
  }

  @Get('animal-type/:animalTypeId')
  getBatchesByAnimalType(@Param('animalTypeId') animalTypeId: string) {
    return this.service.getBatchesByAnimalType(animalTypeId);
  }
}
