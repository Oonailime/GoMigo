import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CaronasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    idPacoteViagem: number;
    idVeiculo?: number;
    idMotorista: number;
    dataIda?: Date;
    dataVolta?: Date;
    precoTotal?: number;
    precoPorPessoa?: number;
    idEnderecoPartida?: number;
    idEnderecoDestino?: number;
    regrasCarona: string;
    vagasDisponiveis?: number;
    status: string;
  }) {
    return this.prisma.carona.create({ data });
  }

  async findAll() {
    return this.prisma.carona.findMany();
  }

  async findOne(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    const carona = await this.prisma.carona.findUnique({ where: { id } });
    if (!carona) {
      throw new NotFoundException('carona nao encontrada');
    }

    return carona;
  }

  async update(
    id: number,
    data: Partial<{
      idVeiculo?: number;
      dataIda?: Date;
      dataVolta?: Date;
      precoTotal?: number;
      precoPorPessoa?: number;
      idEnderecoPartida?: number;
      idEnderecoDestino?: number;
      regrasCarona: string;
      vagasDisponiveis?: number;
      status: string;
    }>,
  ) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    try {
      return await this.prisma.carona.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('carona nao encontrada');
      }
      throw error;
    }
  }

  async delete(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    try {
      return await this.prisma.carona.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('carona nao encontrada');
      }
      throw error;
    }
  }
}
