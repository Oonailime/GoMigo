import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TipoPacoteViagem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SearchPacotesDto } from './dto/search-pacotes.dto';

@Injectable()
export class PacotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PacoteViagemUncheckedCreateInput) {
    return this.prisma.pacoteViagem.create({ data });
  }

  async findAll() {
    return this.prisma.pacoteViagem.findMany();
  }

  async findOne(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    const pacote = await this.prisma.pacoteViagem.findUnique({ where: { id } });
    if (!pacote) {
      throw new NotFoundException('pacote nao encontrado');
    }

    return pacote;
  }

  async update(id: number, data: Prisma.PacoteViagemUncheckedUpdateInput) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    const existing = await this.prisma.pacoteViagem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('pacote nao encontrado');
    }

    return this.prisma.pacoteViagem.update({ where: { id }, data });
  }

  async delete(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    const existing = await this.prisma.pacoteViagem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('pacote nao encontrado');
    }

    return this.prisma.pacoteViagem.delete({ where: { id } });
  }

  async listarAnunciados() {
    return this.prisma.pacoteViagem.findMany({
      where: {
        privacidade: { not: 'PRIVADO' },
        anuncios: {
          some: {
            statusAnuncio: 'ATIVO',
          },
        },
      },
      include: {
        anuncios: true,
      },
    });
  }

  async search(dto: SearchPacotesDto) {
    const dataInicio = dto.dataInicio;
    const dataFim = dto.dataFim;

    if (dataInicio > dataFim) {
      throw new BadRequestException('dataInicio nao pode ser maior que dataFim');
    }

    const baseWhere = {
      tipoPacoteViagem: dto.tipo as TipoPacoteViagem,
      privacidade: { not: 'PRIVADO' },
      anuncios: {
        some: { statusAnuncio: 'ATIVO' },
      },
      enderecoPartida: {
        cidade: { contains: dto.cidadePartida, mode: 'insensitive' as const },
      },
      enderecoDestino: {
        cidade: { contains: dto.cidadeDestino, mode: 'insensitive' as const },
      },
      dataInicio: { not: null },
      dataFim: { not: null },
    };

    const exatos = await this.prisma.pacoteViagem.findMany({
      where: {
        ...baseWhere,
        dataInicio: { gte: dataInicio },
        dataFim: { lte: dataFim },
      },
      include: {
        enderecoPartida: true,
        enderecoDestino: true,
        anuncios: true,
      },
    });

    if (exatos.length > 0) {
      return { modo: 'EXATO', pacotes: exatos };
    }

    const interseccao = await this.prisma.pacoteViagem.findMany({
      where: {
        ...baseWhere,
        dataInicio: { lte: dataFim },
        dataFim: { gte: dataInicio },
      },
      include: {
        enderecoPartida: true,
        enderecoDestino: true,
        anuncios: true,
      },
    });

    if (interseccao.length > 0) {
      return {
        modo: 'INTERSECCAO',
        mensagem: 'Nao ha pacotes no periodo exato, mostrando datas proximas.',
        pacotes: interseccao,
      };
    }

    return {
      modo: 'SEM_RESULTADOS',
      mensagem: 'Nao ha pacotes disponiveis para este filtro. Considere criar um novo pacote.',
      pacotes: [],
    };
  }
}
