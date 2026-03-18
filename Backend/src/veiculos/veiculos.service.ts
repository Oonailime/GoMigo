import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VeiculosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    idUserProprietario: number;
    marca: string;
    modelo: string;
    cor?: string;
    placa: string;
    ano?: number;
    capacidadePassageiros: number;
  }) {
    return this.prisma.veiculo.create({ data });
  }

  async findAll() {
    return this.prisma.veiculo.findMany();
  }

  async findOne(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    const veiculo = await this.prisma.veiculo.findUnique({ where: { id } });
    if (!veiculo) {
      throw new NotFoundException('veiculo nao encontrado');
    }

    return veiculo;
  }

  async update(
    id: number,
    data: Partial<{
      marca: string;
      modelo: string;
      cor?: string;
      placa: string;
      ano?: number;
      capacidadePassageiros: number;
    }>,
  ) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    try {
      return await this.prisma.veiculo.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('veiculo nao encontrado');
      }
      throw error;
    }
  }

  async delete(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    try {
      return await this.prisma.veiculo.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('veiculo nao encontrado');
      }
      throw error;
    }
  }
}
