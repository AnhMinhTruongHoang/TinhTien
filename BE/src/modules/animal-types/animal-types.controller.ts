import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { CreateAnimalTypeDto } from './dto/create-animal-type.dto';
import { UpdateAnimalTypeDto } from './dto/update-animal-type.dto';
import { AnimalTypeService } from './animal-types.service';

@Controller('animal-types')
export class AnimalTypesController {
  constructor(private readonly service: AnimalTypeService) {}

  @Post()
  create(@Body() dto: CreateAnimalTypeDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateAnimalTypeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
