import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MonthlyPayrollsController } from './monthly-payrolls.controller';
import { MonthlyPayrollsService } from './monthly-payrolls.service';
import { MonthlyPayrollSchema } from './schemas/monthly-payroll.schemas';
import { EmployeeSchema } from '../employee/schemas/employee.schemas';
import { EmployeeAbsenceSchema } from '../employee-absence/schemas/employee-absence.schemas';
import { SalaryAdvanceSchema } from '../salary-advances/schemas/salary-advance.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'MonthlyPayroll',
        schema: MonthlyPayrollSchema,
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
        name: 'SalaryAdvance',

        schema: SalaryAdvanceSchema,
      },
    ]),
  ],

  controllers: [MonthlyPayrollsController],

  providers: [MonthlyPayrollsService],

  exports: [MonthlyPayrollsService],
})
export class MonthlyPayrollsModule {}
