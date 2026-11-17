import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ProfileController } from './profile.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret:
          process.env.JWT_SECRET || 'kirans-infotech-dev-jwt-secret-key-2026',
        signOptions: {
          expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController, ProfileController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
