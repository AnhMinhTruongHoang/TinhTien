import { Body, Controller, Delete, Get, Param, Post, Res } from '@nestjs/common';

import type { Response } from 'express';

import { BackupService } from './backup.service';
import { RestoreBackupDto } from './dto/restore-backup.dto';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  // =====================================================
  // CREATE
  // =====================================================

  @Post()
  createBackup() {
    return this.backupService.createBackup();
  }

  // =====================================================
  // LIST
  // =====================================================

  @Get()
  getBackups() {
    return this.backupService.getBackups();
  }

  // =====================================================
  // DOWNLOAD
  // =====================================================

  @Get(':filename/download')
  downloadBackup(
    @Param('filename')
    filename: string,

    @Res()
    res: Response,
  ) {
    const filePath = this.backupService.getBackupPath(filename);

    return res.download(filePath, filename);
  }

  // =====================================================
  // DELETE
  // =====================================================

  @Delete(':filename')
  deleteBackup(
    @Param('filename')
    filename: string,
  ) {
    return this.backupService.deleteBackup(filename);
  }

  // =====================================================
  // RESTORE TO TEST DATABASE
  // =====================================================

  @Post(':filename/restore-test')
  restoreBackupToTest(
    @Param('filename')
    filename: string,
  ) {
    return this.backupService.restoreBackupToTest(filename);
  }

  // =====================================================
  // RESTORE DATABASE THẬT
  // =====================================================

  @Post(':filename/restore')
  restoreBackup(
    @Param('filename')
    filename: string,

    @Body()
    dto: RestoreBackupDto,
  ) {
    return this.backupService.restoreBackup(filename, dto.confirmation);
  }
}
