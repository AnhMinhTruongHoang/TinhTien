import { IsNotEmpty, IsString, Equals } from 'class-validator';

export class RestoreBackupDto {
  @IsString()
  @IsNotEmpty()
  @Equals('KHOI PHUC', {
    message: 'Bạn phải nhập chính xác "KHOI PHUC" để xác nhận',
  })
  confirmation: string;
}
