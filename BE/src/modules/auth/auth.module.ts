import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { AdminSchema } from './schemas/admin.schemas';

import { AuthController } from './auth.controller';

import { AuthService } from './auth.service';

import { JwtStrategy } from './jwt.strategy';

import { JwtAuthGuard } from './jwt-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Admin',
        schema: AdminSchema,
      },
    ]),

    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;

        if (!secret) {
          throw new Error('JWT_SECRET chưa được cấu hình trong .env');
        }

        return {
          secret,

          signOptions: {
            expiresIn: Number(process.env.JWT_EXPIRES_SECONDS || 43200),
          },
        };
      },
    }),
  ],

  controllers: [AuthController],

  providers: [AuthService, JwtStrategy, JwtAuthGuard],

  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
