import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type TipoAvaliacao = 'PACOTE' | 'ORGANIZADOR' | 'VIAJANTE';

@Injectable()
export class AvaliacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(data: {
    tipo: TipoAvaliacao;
    idUserAutor: number;
    idPacoteViagem?: number;
    idUserAvaliado?: number;
    nota: number;
    comentario?: string;
  }) {
    if (!data.idUserAutor || Number.isNaN(data.idUserAutor)) {
      throw new BadRequestException('idUserAutor invalido');
    }

    if (data.tipo === 'PACOTE') {
      if (!data.idPacoteViagem) {
        throw new BadRequestException('idPacoteViagem obrigatorio');
      }

      const pacote = await this.prisma.pacoteViagem.findUnique({ where: { id: data.idPacoteViagem } });
      if (!pacote) {
        throw new NotFoundException('pacote nao encontrado');
      }

      return this.prisma.avaliacao.create({
        data: {
          idPacoteViagem: data.idPacoteViagem,
          idUserAutor: data.idUserAutor,
          nota: data.nota,
          comentario: data.comentario,
        },
      });
    }

    if (data.tipo === 'ORGANIZADOR') {
      if (!data.idPacoteViagem || !data.idUserAvaliado) {
        throw new BadRequestException('idPacoteViagem e idUserAvaliado obrigatorios');
      }

      const pacote = await this.prisma.pacoteViagem.findUnique({ where: { id: data.idPacoteViagem } });
      if (!pacote) {
        throw new NotFoundException('pacote nao encontrado');
      }

      if (pacote.idOrganizador !== data.idUserAvaliado) {
        throw new ForbiddenException('avaliacao deve ser do organizador do pacote');
      }

      return this.prisma.avaliacao.create({
        data: {
          idPacoteViagem: data.idPacoteViagem,
          idUserAutor: data.idUserAutor,
          idUserAvaliado: data.idUserAvaliado,
          nota: data.nota,
          comentario: data.comentario,
        },
      });
    }

    if (data.tipo === 'VIAJANTE') {
      if (!data.idPacoteViagem || !data.idUserAvaliado) {
        throw new BadRequestException('idPacoteViagem e idUserAvaliado obrigatorios');
      }

      const pacote = await this.prisma.pacoteViagem.findUnique({ where: { id: data.idPacoteViagem } });
      if (!pacote) {
        throw new NotFoundException('pacote nao encontrado');
      }

      const viajante = await this.prisma.viajante.findUnique({
        where: {
          idPacoteViagem_idUser: {
            idPacoteViagem: data.idPacoteViagem,
            idUser: data.idUserAvaliado,
          },
        },
      });

      if (!viajante) {
        throw new ForbiddenException('usuario avaliado nao eh viajante do pacote');
      }

      return this.prisma.avaliacao.create({
        data: {
          idPacoteViagem: data.idPacoteViagem,
          idUserAutor: data.idUserAutor,
          idUserAvaliado: data.idUserAvaliado,
          nota: data.nota,
          comentario: data.comentario,
        },
      });
    }

    throw new BadRequestException('tipo de avaliacao invalido');
  }
}
