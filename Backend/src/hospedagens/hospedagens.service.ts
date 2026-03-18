import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  async findAll() {
    return this.prisma.hospedagem.findMany();
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
}
