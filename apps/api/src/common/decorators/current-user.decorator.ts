import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RoleName } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  roles: RoleName[];
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
