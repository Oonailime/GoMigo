import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnderecosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    rua: string;
    cep: string;
    numero?: number;
    complemento?: string;
    estado: string;
    cidade: string;
  }) {
    return this.prisma.endereco.create({ data });
  }

  async update(
    id: number,
    data: Partial<{
      rua: string;
      cep: string;
      numero?: number;
      complemento?: string;
      estado: string;
      cidade: string;
    }>,
  ) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    try {
      return await this.prisma.endereco.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('endereco nao encontrado');
      }
      throw error;
    }
  }

  async delete(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    try {
      return await this.prisma.endereco.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('endereco nao encontrado');
      }
      throw error;
    }
  }
}
