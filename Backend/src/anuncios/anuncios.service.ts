import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnunciosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    idPacoteViagem: number;
    idOrganizador: number;
    tituloAnuncio: string;
    descricaoAnuncio?: string;
    statusAnuncio: string;
    orcamento?: number;
    dataInicio?: Date;
    dataFim?: Date;
  }) {
    return this.prisma.anuncioPacote.create({ data });
  }

  async update(
    id: number,
    data: Partial<{
      tituloAnuncio: string;
      descricaoAnuncio?: string;
      statusAnuncio: string;
      orcamento?: number;
      dataInicio?: Date;
      dataFim?: Date;
    }>,
  ) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    try {
      return await this.prisma.anuncioPacote.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('anuncio nao encontrado');
      }
      throw error;
    }
  }

  async delete(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    try {
      return await this.prisma.anuncioPacote.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('anuncio nao encontrado');
      }
      throw error;
    }
  }
}
