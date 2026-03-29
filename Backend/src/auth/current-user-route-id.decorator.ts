import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { readCurrentUserId } from './current-user-id.decorator';

type AuthenticatedRouteRequest = {
  user?: { sub?: number | null };
  params?: Record<string, string | undefined>;
};

export function readCurrentUserRouteId(
  request: AuthenticatedRouteRequest,
  paramName = 'id',
): number {
  const userId = readCurrentUserId(request);
  const rawParam = request.params?.[paramName];
  const routeId = Number(rawParam);

  if (!Number.isInteger(routeId)) {
    throw new ForbiddenException(`parametro ${paramName} invalido para a rota autenticada`);
  }

  if (userId !== routeId) {
    throw new ForbiddenException('usuario nao pode acessar outro perfil por esta rota');
  }

  return routeId;
}

export const CurrentUserRouteId = createParamDecorator(
  (paramName: string | undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest<AuthenticatedRouteRequest>();
    return readCurrentUserRouteId(request, paramName);
  },
);
