import { BadRequestException, Injectable } from '@nestjs/common';
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

  async update(id: number, data: Partial<{
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
  }>) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }
    return this.prisma.carona.update({ where: { id }, data });
  }

  async delete(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }
    return this.prisma.carona.delete({ where: { id } });
  }
}
