import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { config as loadEnv } from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client | null;

  constructor(private readonly prisma: PrismaService) {
    const envCandidates = [
      resolve(__dirname, '..', '..', '.env'),
      resolve(process.cwd(), '.env'),
      resolve(process.cwd(), 'Backend', '.env'),
    ];

    for (const envPath of envCandidates) {
      if (existsSync(envPath)) {
        loadEnv({ path: envPath, override: false });
      }
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    this.googleClient = clientId ? new OAuth2Client(clientId) : null;
  }

  private issueAccessToken(data: {
    userId: number | null;
    email: string;
    name: string | null;
    userStatus: 'ACTIVE' | 'INCOMPLETE';
  }) {
    const secret = process.env.BACKEND_JWT_SECRET;
    if (!secret) {
      throw new Error('BACKEND_JWT_SECRET nao configurado');
    }

    return jwt.sign(
      {
        sub: data.userId,
        email: data.email,
        name: data.name,
        status: data.userStatus,
      },
      secret,
      { expiresIn: '7d' },
    );
  }

  async handleGoogleLogin(idToken: string) {
    if (!idToken) {
      throw new BadRequestException('idToken obrigatorio');
    }

    if (!this.googleClient || !process.env.GOOGLE_CLIENT_ID) {
      throw new UnauthorizedException('GOOGLE_CLIENT_ID nao configurado');
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      console.log('[auth][google] validating token', {
        requiredAudience: process.env.GOOGLE_CLIENT_ID,
        tokenAudience: payload?.aud ?? null,
        authorizedParty: payload?.azp ?? null,
        issuer: payload?.iss ?? null,
        email: payload?.email ?? null,
      });

      if (!payload?.email) {
        throw new UnauthorizedException('token invalido');
      }

      const user = await this.prisma.user.findUnique({
        where: { email: payload.email },
      });

      const userStatus = user ? 'ACTIVE' : 'INCOMPLETE';
      const accessToken = this.issueAccessToken({
        userId: user?.id ?? null,
        email: payload.email,
        name: payload.name ?? null,
        userStatus,
      });

      return { accessToken, userStatus };
    } catch (error) {
      console.error('[auth][google] login failed', {
        message: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('falha ao validar autenticacao Google');
    }
  }

  async completeProfile(
    email: string,
    defaultName: string | null,
    data: { name?: string; cpf: string; phoneNumber: string },
  ) {
    if (!email) {
      throw new BadRequestException('email invalido');
    }

    if (!data?.cpf || !data?.phoneNumber) {
      throw new BadRequestException('cpf e phoneNumber obrigatorios');
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    const user =
      existing ??
      (await this.prisma.user.create({
        data: {
          name: data.name ?? defaultName ?? 'Usuario',
          cpf: data.cpf,
          phoneNumber: data.phoneNumber,
          email,
          status: 'ATIVO',
        },
      }));

    const accessToken = this.issueAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      userStatus: 'ACTIVE',
    });

    return {
      accessToken,
      userStatus: 'ACTIVE' as const,
      user,
    };
  }

  async getProfile(email: string) {
    if (!email) {
      throw new BadRequestException('email invalido');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('usuario nao encontrado');
    }

    return user;
  }

  async updateProfile(
    email: string,
    data: { name?: string; cpf?: string; phoneNumber?: string },
  ) {
    if (!email) {
      throw new BadRequestException('email invalido');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('usuario nao encontrado');
    }

    return this.prisma.user.update({
      where: { email },
      data: {
        name: data.name ?? user.name,
        cpf: data.cpf ?? user.cpf,
        phoneNumber: data.phoneNumber ?? user.phoneNumber,
      },
    });
  }
}
