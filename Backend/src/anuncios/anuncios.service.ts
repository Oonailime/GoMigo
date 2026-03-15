import { BadRequestException, Injectable } from '@nestjs/common';
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

  async update(id: number, data: Partial<{
    tituloAnuncio: string;
    descricaoAnuncio?: string;
    statusAnuncio: string;
    orcamento?: number;
    dataInicio?: Date;
    dataFim?: Date;
  }>) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }
    return this.prisma.anuncioPacote.update({ where: { id }, data });
  }

  async delete(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }
    return this.prisma.anuncioPacote.delete({ where: { id } });
  }
}
