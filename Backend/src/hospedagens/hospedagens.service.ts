import { BadRequestException, Injectable } from '@nestjs/common';
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

  async update(id: number, data: Partial<{
    idEndereco?: number;
    nomeLocal?: string;
    dataCheckin?: Date;
    dataCheckout?: Date;
    precoTotal?: number;
    precoPorPessoa?: number;
    regrasHospedagem: string;
    statusReserva: string;
  }>) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }
    return this.prisma.hospedagem.update({ where: { id }, data });
  }

  async delete(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }
    return this.prisma.hospedagem.delete({ where: { id } });
  }
}
