import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PacotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    idOrganizador: number;
    idEnderecoPartida: number;
    idEnderecoDestino: number;
    titulo: string;
    descricao?: string;
    tipoPacoteViagem: string;
    status: string;
    vagas: number;
    regrasViagem: string;
    valorTotalPrevisto?: number;
    valorPorPessoaPrevisto?: number;
    dataInicio?: Date;
    dataFim?: Date;
    privacidade: string;
  }) {
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

  async update(
    id: number,
    data: Partial<{
      idEnderecoPartida: number;
      idEnderecoDestino: number;
      titulo: string;
      descricao?: string;
      tipoPacoteViagem: string;
      status: string;
      vagas: number;
      regrasViagem: string;
      valorTotalPrevisto?: number;
      valorPorPessoaPrevisto?: number;
      dataInicio?: Date;
      dataFim?: Date;
      privacidade?: string;
    }>,
  ) {
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
}
