import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

function extractJwtFromCookieOrHeader(req: Request): string | null {
  if (req?.cookies?.kiran_token) {
    return req.cookies.kiran_token;
  }
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: extractJwtFromCookieOrHeader,
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET || 'kirans-infotech-dev-jwt-secret-key-2026',
    });
  }

  async validate(payload: { sub: string; email: string }): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: { include: { role: true } },
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is inactive or not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.userRoles.map((ur) => ur.role.name),
    };
  }
}
