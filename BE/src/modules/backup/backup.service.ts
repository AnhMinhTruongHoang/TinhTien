import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs';

import { join, basename } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

@Injectable()
export class BackupService {
  private readonly backupDir = join(process.cwd(), 'backups');

  constructor() {
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, {
        recursive: true,
      });
    }
  }

  // =====================================================
  // CREATE BACKUP
  // =====================================================

  async createBackup() {
    try {
      const mongoUri =
        process.env.MONGO_URI || 'mongodb://localhost:27017/TinhTien';

      const now = new Date();

      const timestamp = now
        .toISOString()
        .replace(/:/g, '-')
        .replace(/\..+/, '');

      const filename = `TinhTien_${timestamp}.archive.gz`;

      const filePath = join(this.backupDir, filename);
      const mongodumpPath = process.env.MONGODUMP_PATH || 'mongodump';

      console.log('MONGODUMP PATH:', mongodumpPath);

      await execFileAsync(
        mongodumpPath,
        ['--uri', mongoUri, `--archive=${filePath}`, '--gzip'],
        {
          windowsHide: true,
        },
      );

      const stats = statSync(filePath);

      return {
        success: true,

        filename,

        size: stats.size,

        createdAt: stats.birthtime,

        message: 'Sao lưu dữ liệu thành công',
      };
    } catch (error: any) {
      console.error('BACKUP ERROR:', error);

      throw new InternalServerErrorException(
        error?.message?.includes('mongodump')
          ? 'Không tìm thấy mongodump. Hãy cài MongoDB Database Tools.'
          : 'Không thể tạo bản sao lưu',
      );
    }
  }

  // =====================================================
  // LIST BACKUPS
  // =====================================================

  getBackups() {
    if (!existsSync(this.backupDir)) {
      return [];
    }

    return readdirSync(this.backupDir)
      .filter((file) => file.endsWith('.archive.gz'))
      .map((filename) => {
        const filePath = join(this.backupDir, filename);

        const stats = statSync(filePath);

        return {
          filename,

          size: stats.size,

          createdAt: stats.birthtime,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  // =====================================================
  // GET FILE
  // =====================================================

  getBackupPath(filename: string) {
    const safeFilename = basename(filename);

    const filePath = join(this.backupDir, safeFilename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Không tìm thấy file backup');
    }

    return filePath;
  }

  // =====================================================
  // DELETE
  // =====================================================

  deleteBackup(filename: string) {
    const safeFilename = basename(filename);

    const filePath = join(this.backupDir, safeFilename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Không tìm thấy file backup');
    }

    unlinkSync(filePath);

    return {
      success: true,

      message: 'Đã xóa bản sao lưu',
    };
  }

  // =====================================================
  // RESTORE BACKUP TO TEST DATABASE
  // =====================================================

  async restoreBackupToTest(filename: string) {
    const safeFilename = basename(filename);

    const filePath = join(this.backupDir, safeFilename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Không tìm thấy file backup');
    }

    const mongoUri =
      process.env.MONGO_URI || 'mongodb://localhost:27017/TinhTien';

    const mongorestorePath = process.env.MONGORESTORE_PATH || 'mongorestore';

    const sourceDatabase = process.env.MONGO_DB_NAME || 'TinhTien';

    const targetDatabase =
      process.env.RESTORE_TEST_DB || 'TinhTien_Restore_Test';

    try {
      console.log('RESTORE FILE:', filePath);

      console.log('RESTORE FROM:', sourceDatabase);

      console.log('RESTORE TO:', targetDatabase);

      console.log('MONGORESTORE PATH:', mongorestorePath);

      const { stdout, stderr } = await execFileAsync(
        mongorestorePath,
        [
          '--uri',
          mongoUri,

          `--archive=${filePath}`,

          '--gzip',

          // Xóa collection cũ trong DB test
          // trước khi restore lại
          '--drop',

          // Đổi namespace:
          // TinhTien.xxx
          // ->
          // TinhTien_Restore_Test.xxx
          `--nsFrom=${sourceDatabase}.*`,

          `--nsTo=${targetDatabase}.*`,
        ],
        {
          windowsHide: true,
        },
      );

      if (stdout) {
        console.log('RESTORE STDOUT:', stdout);
      }

      if (stderr) {
        console.log('RESTORE STDERR:', stderr);
      }

      return {
        success: true,

        filename: safeFilename,

        sourceDatabase,

        targetDatabase,

        message: `Khôi phục thành công vào database ${targetDatabase}`,
      };
    } catch (error: any) {
      console.error('RESTORE ERROR:', error);

      throw new InternalServerErrorException(
        error?.code === 'ENOENT'
          ? 'Không tìm thấy mongorestore. Kiểm tra MONGORESTORE_PATH.'
          : 'Không thể khôi phục bản sao lưu',
      );
    }
  }

  // =====================================================
  // RESTORE DATABASE THẬT
  // Tự backup DB hiện tại trước khi restore
  // =====================================================

  async restoreBackup(filename: string, confirmation: string) {
    if (confirmation !== 'KHOI PHUC') {
      throw new BadRequestException('Xác nhận khôi phục không hợp lệ');
    }

    const safeFilename = basename(filename);

    const filePath = join(this.backupDir, safeFilename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Không tìm thấy file backup');
    }

    const mongoUri =
      process.env.MONGO_URI || 'mongodb://localhost:27017/TinhTien';

    const mongorestorePath = process.env.MONGORESTORE_PATH || 'mongorestore';

    const databaseName = process.env.MONGO_DB_NAME || 'TinhTien';

    try {
      // =====================================================
      // BƯỚC 1: AUTO BACKUP DATABASE HIỆN TẠI
      // =====================================================

      console.log('CREATE SAFETY BACKUP BEFORE RESTORE...');

      const safetyBackup = await this.createBackup();

      console.log('SAFETY BACKUP:', safetyBackup.filename);

      // =====================================================
      // BƯỚC 2: RESTORE DATABASE
      // =====================================================

      console.log('RESTORE DATABASE:', databaseName);

      console.log('RESTORE FILE:', safeFilename);

      const { stdout, stderr } = await execFileAsync(
        mongorestorePath,
        [
          '--uri',
          mongoUri,

          `--archive=${filePath}`,

          '--gzip',

          // Chỉ restore DB TinhTien
          `--nsInclude=${databaseName}.*`,

          // Xóa collection hiện tại
          // trước khi restore collection tương ứng
          '--drop',
        ],
        {
          windowsHide: true,
        },
      );

      if (stdout) {
        console.log('RESTORE STDOUT:', stdout);
      }

      if (stderr) {
        console.log('RESTORE STDERR:', stderr);
      }

      return {
        success: true,

        restoredFile: safeFilename,

        database: databaseName,

        safetyBackup: safetyBackup.filename,

        message: 'Khôi phục database thành công',
      };
    } catch (error: any) {
      console.error('REAL RESTORE ERROR:', error);

      throw new InternalServerErrorException(
        error?.code === 'ENOENT'
          ? 'Không tìm thấy mongorestore'
          : 'Không thể khôi phục database',
      );
    }
  }
}
