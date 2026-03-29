import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const CurrentUserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest<{ user?: { sub?: number | null } }>();
    const userId = request.user?.sub;

    if (!userId) {
      throw new UnauthorizedException('usuario sem perfil completo');
    }

    return userId;
  },
);
