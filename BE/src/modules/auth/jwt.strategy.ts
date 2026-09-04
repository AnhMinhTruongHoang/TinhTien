import { Injectable } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import type { Request } from 'express';

const COOKIE_NAME = 'tinh_tien_token';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET chưa được cấu hình trong .env');
  }

  return secret;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.[COOKIE_NAME] || null,

        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),

      ignoreExpiration: false,

      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: { sub: string; username: string; name: string }) {
    return {
      adminId: payload.sub,

      username: payload.username,

      name: payload.name,
    };
  }
}
