import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { SalaryAdvancesController } from './salary-advances.controller';

import { SalaryAdvancesService } from './salary-advances.service';
import { SalaryAdvanceSchema } from './schemas/salary-advance.schemas';
import { EmployeeSchema } from '../employee/schemas/employee.schemas';
import { EmployeeAbsenceSchema } from '../employee-absence/schemas/employee-absence.schemas';
import { MonthlyPayrollSchema } from '../monthly-payrolls/schemas/monthly-payroll.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'SalaryAdvance',

        schema: SalaryAdvanceSchema,
      },

      {
        name: 'Employee',

        schema: EmployeeSchema,
      },

      {
        name: 'EmployeeAbsence',

        schema: EmployeeAbsenceSchema,
      },

      {
        name: 'MonthlyPayroll',

        schema: MonthlyPayrollSchema,
      },
    ]),
  ],

  controllers: [SalaryAdvancesController],

  providers: [SalaryAdvancesService],

  exports: [SalaryAdvancesService],
})
export class SalaryAdvancesModule {}
