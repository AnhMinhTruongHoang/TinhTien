import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeAbsenceSchema } from './schemas/employee-absence.schemas';
import { EmployeeSchema } from '../employee/schemas/employee.schemas';
import { EmployeeAbsencesController } from './employee-absence.controller';
import { EmployeeAbsencesService } from './employee-absence.service';
import { MonthlyPayrollsModule } from '../monthly-payrolls/monthly-payrolls.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'EmployeeAbsence',
        schema: EmployeeAbsenceSchema,
      },
      {
        name: 'Employee',
        schema: EmployeeSchema,
      },
    ]),

    MonthlyPayrollsModule,
  ],

  controllers: [EmployeeAbsencesController],

  providers: [EmployeeAbsencesService],
})
export class EmployeeAbsencesModule {}
