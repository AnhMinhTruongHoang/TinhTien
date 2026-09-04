import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeDocument } from './schemas/employee.schemas';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel('Employee')
    private readonly employeeModel: Model<EmployeeDocument>,
  ) {}

  async create(dto: CreateEmployeeDto) {
    return new this.employeeModel(dto).save();
  }

  async findAll() {
    return this.employeeModel
      .find()
      .sort({
        isActive: -1,
        name: 1,
      })
      .lean()
      .exec();
  }

  async findById(id: string) {
    const employee = await this.employeeModel.findById(id).exec();

    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    const employee = await this.employeeModel
      .findByIdAndUpdate(id, dto, {
        returnDocument: 'after',
      })
      .exec();

    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    return employee;
  }

  async delete(id: string) {
    const employee = await this.employeeModel.findByIdAndDelete(id);

    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    return employee;
  }
}
