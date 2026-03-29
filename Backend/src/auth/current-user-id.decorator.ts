import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

type AuthenticatedRequest = { user?: { sub?: number | null } };

export function readCurrentUserId(request: AuthenticatedRequest): number {
  const userId = request.user?.sub;

  if (!userId) {
    throw new UnauthorizedException('usuario sem perfil completo');
  }

  return userId;
}

export const CurrentUserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return readCurrentUserId(request);
  },
);
