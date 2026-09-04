import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
} from '@nestjs/common';

import type { Request, Response } from 'express';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';

const COOKIE_NAME = 'tinh_tien_token';

const getCookieMaxAge = () =>
  Number(process.env.JWT_EXPIRES_SECONDS || 43200) * 1000;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // =====================================================
  // LOGIN - PUBLIC
  // =====================================================

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body()
    dto: LoginDto,

    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    const result = await this.authService.login(dto);

    response.cookie(COOKIE_NAME, result.accessToken, {
      httpOnly: true,

      secure: process.env.NODE_ENV === 'production',

      sameSite: 'lax',

      maxAge: getCookieMaxAge(),

      path: '/',
    });

    return {
      admin: result.admin,
    };
  }

  // =====================================================
  // CURRENT ADMIN - PRIVATE
  // Guard global tự bảo vệ
  // =====================================================

  @Get('me')
  async me(
    @Req()
    request: Request & {
      user?: {
        adminId: string;
      };
    },
  ) {
    return this.authService.getProfile(request.user!.adminId);
  }

  // =====================================================
  // LOGOUT
  // Cho public để JWT hết hạn vẫn xóa cookie được
  // =====================================================

  @Public()
  @Post('logout')
  @HttpCode(200)
  logout(
    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    response.clearCookie(COOKIE_NAME, {
      httpOnly: true,

      secure: process.env.NODE_ENV === 'production',

      sameSite: 'lax',

      path: '/',
    });

    return {
      message: 'Đăng xuất thành công',
    };
  }
}
