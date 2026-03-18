import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] ?? request.headers['Authorization'];

    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('token ausente');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('token invalido');
    }

    const secret = process.env.BACKEND_JWT_SECRET;
    if (!secret) {
      throw new UnauthorizedException('jwt secret nao configurado');
    }

    try {
      const decoded = jwt.verify(token, secret);

      if (!decoded || typeof decoded === 'string') {
        throw new UnauthorizedException('token invalido');
      }

      const payload = decoded as unknown as {
        sub: number | null;
        email: string;
        name?: string | null;
        status?: string;
      };

      if (!payload.email) {
        throw new UnauthorizedException('token invalido');
      }

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('token invalido');
    }
  }
}
