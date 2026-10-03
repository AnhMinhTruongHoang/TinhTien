import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Body,
} from '@nestjs/common';
import { DebtsService } from './debts.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import {
  DebtDeleteResponse,
  DebtListResponse,
  DebtOwnerResponse,
  DebtResponse,
  DebtSummaryResponse,
  DebtUpdateResponse,
} from 'src/type/debts.types';

@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Post()
  async create(@Body() dto: CreateDebtDto): Promise<DebtResponse> {
    return this.debtsService.create(dto);
  }

  @Get('summary')
  async getSummary(): Promise<DebtSummaryResponse> {
    return this.debtsService.getSummary();
  }

  @Get('owner/:ownerId')
  async findByOwner(
    @Param('ownerId') ownerId: string,
  ): Promise<DebtOwnerResponse> {
    return this.debtsService.findByOwner(ownerId);
  }

  @Get()
  async findAll(): Promise<DebtListResponse[]> {
    return this.debtsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<DebtListResponse> {
    return this.debtsService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDebtDto,
  ): Promise<DebtUpdateResponse> {
    return this.debtsService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<DebtDeleteResponse> {
    return this.debtsService.delete(id);
  }
}
