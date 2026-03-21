import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type TipoAvaliacao = 'PACOTE' | 'ORGANIZADOR' | 'VIAJANTE';

@Injectable()
export class AvaliacoesService {
  constructor(private readonly prisma: PrismaService) {}

  private getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  private canEvaluatePackage(pacote: { status: string; dataFim: Date | null }) {
    if (pacote.status === 'FINALIZADO') {
      return true;
    }

    if (!pacote.dataFim) {
      return false;
    }

    return this.getTodayKey() > pacote.dataFim.toISOString().slice(0, 10);
  }

  async criar(data: {
    tipo: TipoAvaliacao;
    idUserAutor: number;
    idPacoteViagem: number;
    idUserAvaliado?: number;
    nota: number;
    comentario?: string;
  }) {
    if (!data.idUserAutor || Number.isNaN(data.idUserAutor)) {
      throw new BadRequestException('idUserAutor invalido');
    }

    if (!data.idPacoteViagem || Number.isNaN(data.idPacoteViagem)) {
      throw new BadRequestException('idPacoteViagem invalido');
    }

    const pacote = await this.prisma.pacoteViagem.findUnique({ where: { id: data.idPacoteViagem } });
    if (!pacote) {
      throw new NotFoundException('pacote nao encontrado');
    }

    if (!this.canEvaluatePackage(pacote)) {
      throw new ForbiddenException('pacote ainda nao elegivel para avaliacao');
    }

    const autorEhOrganizador = pacote.idOrganizador === data.idUserAutor;
    const autorEhViajante = await this.prisma.viajante.findUnique({
      where: {
        idPacoteViagem_idUser: {
          idPacoteViagem: data.idPacoteViagem,
          idUser: data.idUserAutor,
        },
      },
    });

    if (!autorEhOrganizador && (!autorEhViajante || autorEhViajante.statusParticipacao !== 'ATIVO')) {
      throw new ForbiddenException('autor nao participa do pacote');
    }

    if (data.tipo === 'PACOTE') {
      const existente = await this.prisma.avaliacao.findFirst({
        where: {
          idPacoteViagem: data.idPacoteViagem,
          idUserAutor: data.idUserAutor,
          tipo: 'PACOTE',
        },
      });

      if (existente) {
        throw new ConflictException('avaliacao do pacote ja realizada');
      }

      return this.prisma.avaliacao.create({
        data: {
          idPacoteViagem: data.idPacoteViagem,
          idUserAutor: data.idUserAutor,
          nota: data.nota,
          comentario: data.comentario,
          tipo: 'PACOTE',
        },
      });
    }

    if (!data.idUserAvaliado || Number.isNaN(data.idUserAvaliado)) {
      throw new BadRequestException('idUserAvaliado invalido');
    }

    if (data.idUserAvaliado === data.idUserAutor) {
      throw new BadRequestException('autor nao pode avaliar a si mesmo');
    }

    if (data.tipo === 'ORGANIZADOR') {
      if (data.idUserAvaliado !== pacote.idOrganizador) {
        throw new ForbiddenException('avaliacao deve ser do organizador do pacote');
      }

      if (autorEhOrganizador) {
        throw new BadRequestException('organizador nao pode se avaliar');
      }

      try {
        return await this.prisma.avaliacao.create({
          data: {
            idPacoteViagem: data.idPacoteViagem,
            idUserAutor: data.idUserAutor,
            idUserAvaliado: data.idUserAvaliado,
            nota: data.nota,
            comentario: data.comentario,
            tipo: 'ORGANIZADOR',
          },
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new ConflictException('avaliacao do organizador ja realizada');
        }
        throw error;
      }
    }

    if (data.tipo === 'VIAJANTE') {
      if (data.idUserAvaliado === pacote.idOrganizador) {
        throw new ForbiddenException('organizador so pode ser avaliado como organizador');
      }

      const alvoViajante = await this.prisma.viajante.findUnique({
        where: {
          idPacoteViagem_idUser: {
            idPacoteViagem: data.idPacoteViagem,
            idUser: data.idUserAvaliado,
          },
        },
      });

      if (!alvoViajante || alvoViajante.statusParticipacao !== 'ATIVO') {
        throw new ForbiddenException('usuario avaliado nao eh viajante do pacote');
      }

      try {
        return await this.prisma.avaliacao.create({
          data: {
            idPacoteViagem: data.idPacoteViagem,
            idUserAutor: data.idUserAutor,
            idUserAvaliado: data.idUserAvaliado,
            nota: data.nota,
            comentario: data.comentario,
            tipo: 'VIAJANTE',
          },
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new ConflictException('avaliacao do viajante ja realizada');
        }
        throw error;
      }
    }

    throw new BadRequestException('tipo de avaliacao invalido');
  }

  async listarPendentes(idPacoteViagem: number, idUserAutor: number) {
    if (!idPacoteViagem || Number.isNaN(idPacoteViagem)) {
      throw new BadRequestException('idPacoteViagem invalido');
    }

    if (!idUserAutor || Number.isNaN(idUserAutor)) {
      throw new BadRequestException('idUserAutor invalido');
    }

    const pacote = await this.prisma.pacoteViagem.findUnique({ where: { id: idPacoteViagem } });
    if (!pacote) {
      throw new NotFoundException('pacote nao encontrado');
    }

    if (!this.canEvaluatePackage(pacote)) {
      throw new ForbiddenException('pacote ainda nao elegivel para avaliacao');
    }

    const autorEhOrganizador = pacote.idOrganizador === idUserAutor;
    const autorEhViajante = await this.prisma.viajante.findUnique({
      where: {
        idPacoteViagem_idUser: {
          idPacoteViagem,
          idUser: idUserAutor,
        },
      },
    });

    if (!autorEhOrganizador && (!autorEhViajante || autorEhViajante.statusParticipacao !== 'ATIVO')) {
      throw new ForbiddenException('autor nao participa do pacote');
    }

    const viajantes = await this.prisma.viajante.findMany({
      where: {
        idPacoteViagem,
        statusParticipacao: 'ATIVO',
      },
      select: { idUser: true },
    });

    const avaliadosExistentes = await this.prisma.avaliacao.findMany({
      where: {
        idPacoteViagem,
        idUserAutor,
      },
      select: {
        tipo: true,
        idUserAvaliado: true,
      },
    });

    const jaAvaliouPacote = avaliadosExistentes.some((a) => a.tipo === 'PACOTE');
    const jaAvaliouSet = new Set(
      avaliadosExistentes
        .filter((a) => a.tipo !== 'PACOTE')
        .map((a) => `${a.tipo}:${a.idUserAvaliado}`),
    );

    const pendentes: Array<{ tipo: TipoAvaliacao; idUserAvaliado: number }> = [];

    if (autorEhOrganizador) {
      for (const v of viajantes) {
        if (v.idUser === idUserAutor) {
          continue;
        }
        const key = `VIAJANTE:${v.idUser}`;
        if (!jaAvaliouSet.has(key)) {
          pendentes.push({ tipo: 'VIAJANTE', idUserAvaliado: v.idUser });
        }
      }
    } else {
      const organizadorKey = `ORGANIZADOR:${pacote.idOrganizador}`;
      if (!jaAvaliouSet.has(organizadorKey)) {
        pendentes.push({ tipo: 'ORGANIZADOR', idUserAvaliado: pacote.idOrganizador });
      }

      for (const v of viajantes) {
        if (v.idUser === idUserAutor) {
          continue;
        }
        const key = `VIAJANTE:${v.idUser}`;
        if (!jaAvaliouSet.has(key) && v.idUser !== pacote.idOrganizador) {
          pendentes.push({ tipo: 'VIAJANTE', idUserAvaliado: v.idUser });
        }
      }
    }

    return {
      pacote: { pendente: !jaAvaliouPacote },
      avaliacoesPendentes: pendentes,
    };
  }
}
