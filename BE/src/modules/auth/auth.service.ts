import {
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { JwtService } from '@nestjs/jwt';

import { Model } from 'mongoose';

import * as bcrypt from 'bcrypt';

import { AdminDocument } from './schemas/admin.schemas';

import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel('Admin')
    private readonly adminModel: Model<AdminDocument>,

    private readonly jwtService: JwtService,
  ) {}

  // =====================================================
  // SEED ADMIN ĐẦU TIÊN
  // =====================================================

  async onModuleInit() {
    const count = await this.adminModel.countDocuments();

    if (count > 0) {
      return;
    }

    const username = process.env.ADMIN_USERNAME;

    const password = process.env.ADMIN_INITIAL_PASSWORD;

    const name = process.env.ADMIN_NAME || 'Administrator';

    if (!username || !password) {
      this.logger.warn(
        'Chưa có Admin và chưa cấu hình ADMIN_USERNAME / ADMIN_INITIAL_PASSWORD',
      );

      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await this.adminModel.create({
      username: username.trim().toLowerCase(),

      passwordHash,

      name,

      isActive: true,
    });

    this.logger.log(`Đã khởi tạo admin: ${username}`);
  }

  // =====================================================
  // LOGIN
  // =====================================================

  async login(dto: LoginDto) {
    const username = dto.username.trim().toLowerCase();

    const admin = await this.adminModel
      .findOne({
        username,
        isActive: true,
      })
      .select('+passwordHash')
      .exec();

    if (!admin) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      admin.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
    }

    admin.lastLoginAt = new Date();

    await admin.save();

    const payload = {
      sub: admin._id.toString(),

      username: admin.username,

      name: admin.name,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,

      admin: {
        _id: admin._id.toString(),

        username: admin.username,

        name: admin.name,

        lastLoginAt: admin.lastLoginAt,
      },
    };
  }

  // =====================================================
  // PROFILE
  // =====================================================

  async getProfile(adminId: string) {
    const admin = await this.adminModel.findById(adminId).lean().exec();

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');
    }

    return {
      _id: admin._id.toString(),

      username: admin.username,

      name: admin.name,

      lastLoginAt: admin.lastLoginAt,
    };
  }
}
