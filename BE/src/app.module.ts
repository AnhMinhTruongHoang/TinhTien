import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OwnerModule } from './modules/owners/owners.module';
import { AnimalTypeModule } from './modules/animal-types/animal-types.module';
import { CalculationHistoryModule } from './modules/calculation-history/calculation-history.module';
import { DailyLogsModule } from './modules/daily-logs/daily-logs.module';
import { BackupModule } from './modules/backup/backup.module';
import { EmployeesModule } from './modules/employee/employee.module';
import { EmployeeAbsencesModule } from './modules/employee-absence/employee-absence.module';
import { MonthlyPayrollsModule } from './modules/monthly-payrolls/monthly-payrolls.module';
import { SalaryAdvancesModule } from './modules/salary-advances/salary-advances.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/TinhTien',
    ),
    OwnerModule,
    AnimalTypeModule,
    CalculationHistoryModule,
    DailyLogsModule,
    BackupModule,
    EmployeesModule,
    EmployeeAbsencesModule,
    MonthlyPayrollsModule,
    SalaryAdvancesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
