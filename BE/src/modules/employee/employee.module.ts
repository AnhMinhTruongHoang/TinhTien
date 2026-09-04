import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeSchema } from './schemas/employee.schemas';
import { EmployeesController } from './employee.controller';
import { EmployeesService } from './employee.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Employee',
        schema: EmployeeSchema,
      },
    ]),
  ],

  controllers: [EmployeesController],

  providers: [EmployeesService],

  exports: [EmployeesService, MongooseModule],
})
export class EmployeesModule {}
