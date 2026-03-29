import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HospedagensService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    idPacoteViagem: number;
    idEndereco?: number;
    nomeLocal?: string;
    dataCheckin?: Date;
    dataCheckout?: Date;
    precoTotal?: number;
    precoPorPessoa?: number;
    regrasHospedagem: string;
    statusReserva: string;
  }) {
    return this.prisma.hospedagem.create({ data });
  }

  private async ensureOrganizerOwnsPackage(idPacoteViagem: number, idOrganizador: number) {
    const pacote = await this.prisma.pacoteViagem.findUnique({
      where: { id: idPacoteViagem },
      select: { id: true, idOrganizador: true },
    });

    if (!pacote) {
      throw new NotFoundException('pacote nao encontrado');
    }

    if (pacote.idOrganizador !== idOrganizador) {
      throw new ForbiddenException('apenas o organizador do pacote pode gerenciar hospedagens');
    }

    return pacote;
  }

  async createForOrganizer(
    idOrganizador: number,
    data: {
      idPacoteViagem: number;
      idEndereco?: number;
      nomeLocal?: string;
      dataCheckin?: Date;
      dataCheckout?: Date;
      precoTotal?: number;
      precoPorPessoa?: number;
      regrasHospedagem: string;
      statusReserva: string;
    },
  ) {
    await this.ensureOrganizerOwnsPackage(data.idPacoteViagem, idOrganizador);
    return this.prisma.hospedagem.create({ data });
  }

  async findAll() {
    return this.prisma.hospedagem.findMany();
  }

  async findByOrganizer(idOrganizador: number) {
    return this.prisma.hospedagem.findMany({
      where: {
        pacoteViagem: {
          idOrganizador,
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    const hospedagem = await this.prisma.hospedagem.findUnique({ where: { id } });
    if (!hospedagem) {
      throw new NotFoundException('hospedagem nao encontrada');
    }

    return hospedagem;
  }

  async findOneForOrganizer(id: number, idOrganizador: number) {
    const hospedagem = await this.prisma.hospedagem.findUnique({
      where: { id },
      include: {
        pacoteViagem: {
          select: {
            idOrganizador: true,
          },
        },
      },
    });

    if (!hospedagem) {
      throw new NotFoundException('hospedagem nao encontrada');
    }

    if (hospedagem.pacoteViagem.idOrganizador !== idOrganizador) {
      throw new ForbiddenException('usuario nao pode acessar esta hospedagem');
    }

    return hospedagem;
  }

  async update(
    id: number,
    data: Partial<{
      idEndereco?: number;
      nomeLocal?: string;
      dataCheckin?: Date;
      dataCheckout?: Date;
      precoTotal?: number;
      precoPorPessoa?: number;
      regrasHospedagem: string;
      statusReserva: string;
    }>,
  ) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    try {
      return await this.prisma.hospedagem.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('hospedagem nao encontrada');
      }
      throw error;
    }
  }

  async updateForOrganizer(
    id: number,
    idOrganizador: number,
    data: Partial<{
      idEndereco?: number;
      nomeLocal?: string;
      dataCheckin?: Date;
      dataCheckout?: Date;
      precoTotal?: number;
      precoPorPessoa?: number;
      regrasHospedagem: string;
      statusReserva: string;
    }>,
  ) {
    await this.findOneForOrganizer(id, idOrganizador);
    return this.update(id, data);
  }

  async delete(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    try {
      return await this.prisma.hospedagem.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('hospedagem nao encontrada');
      }
      throw error;
    }
  }

  async deleteForOrganizer(id: number, idOrganizador: number) {
    await this.findOneForOrganizer(id, idOrganizador);
    return this.delete(id);
  }
}
