import { BadRequestException, Injectable } from '@nestjs/common';
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

  async update(id: number, data: Partial<{
    marca: string;
    modelo: string;
    cor?: string;
    placa: string;
    ano?: number;
    capacidadePassageiros: number;
  }>) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }
    return this.prisma.veiculo.update({ where: { id }, data });
  }

  async delete(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }
    return this.prisma.veiculo.delete({ where: { id } });
  }
}
