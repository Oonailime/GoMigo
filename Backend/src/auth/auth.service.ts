import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client | null;

  private async findProfileByEmail(email: string) {
    const [user] = await this.prisma.$queryRaw<
      Array<{
        id: number;
        name: string;
        cpf: string;
        phoneNumber: string;
        email: string;
        status: string;
        sobreMim: string | null;
        personalidade: string | null;
        experienciaViagem: string | null;
        gostaDeFazer: string | null;
      }>
    >(Prisma.sql`
      SELECT
        id,
        name,
        cpf,
        "phoneNumber",
        email,
        status,
        "sobreMim",
        personalidade,
        "experienciaViagem",
        "gostaDeFazer"
      FROM "tbUser"
      WHERE email = ${email}
      LIMIT 1
    `);

    return user ?? null;
  }

  constructor(private readonly prisma: PrismaService) {
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

      return { accessToken, userStatus, userId: user?.id ?? null };
    } catch (error) {
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

    const user = await this.findProfileByEmail(email);

    if (!user) {
      throw new UnauthorizedException('usuario nao encontrado');
    }

    const [ratingSummary, avaliacoesRecebidas] = await Promise.all([
      this.prisma.avaliacao.aggregate({
        where: {
          idUserAvaliado: user.id,
        },
        _avg: {
          nota: true,
        },
        _count: {
          _all: true,
        },
      }),
      this.prisma.avaliacao.findMany({
        where: {
          idUserAvaliado: user.id,
        },
        orderBy: {
          dataAvaliacao: 'desc',
        },
        include: {
          autor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          pacoteViagem: {
            select: {
              id: true,
              titulo: true,
            },
          },
        },
      }),
    ]);

    return {
      ...user,
      ratingMedia: ratingSummary._avg.nota ?? null,
      totalAvaliacoes: ratingSummary._count._all,
      avaliacoesRecebidas,
    };
  }

  async updateProfile(
    email: string,
    data: {
      name?: string;
      cpf?: string;
      phoneNumber?: string;
      sobreMim?: string;
      personalidade?: string;
      experienciaViagem?: string;
      gostaDeFazer?: string;
    },
  ) {
    if (!email) {
      throw new BadRequestException('email invalido');
    }

    const user = await this.getProfile(email);
    if (!user) {
      throw new UnauthorizedException('usuario nao encontrado');
    }

    const [updated] = await this.prisma.$queryRaw<
      Array<{
        id: number;
        name: string;
        cpf: string;
        phoneNumber: string;
        email: string;
        status: string;
        sobreMim: string | null;
        personalidade: string | null;
        experienciaViagem: string | null;
        gostaDeFazer: string | null;
      }>
    >(Prisma.sql`
      UPDATE "tbUser"
      SET
        name = ${data.name ?? user.name},
        cpf = ${data.cpf ?? user.cpf},
        "phoneNumber" = ${data.phoneNumber ?? user.phoneNumber},
        "sobreMim" = ${data.sobreMim ?? user.sobreMim},
        personalidade = ${data.personalidade ?? user.personalidade},
        "experienciaViagem" = ${data.experienciaViagem ?? user.experienciaViagem},
        "gostaDeFazer" = ${data.gostaDeFazer ?? user.gostaDeFazer}
      WHERE email = ${email}
      RETURNING
        id,
        name,
        cpf,
        "phoneNumber",
        email,
        status,
        "sobreMim",
        personalidade,
        "experienciaViagem",
        "gostaDeFazer"
    `);

    return updated;
  }
}
