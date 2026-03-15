import { BadRequestException, Injectable } from '@nestjs/common';
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

  async update(id: number, data: Partial<{
    rua: string;
    cep: string;
    numero?: number;
    complemento?: string;
    estado: string;
    cidade: string;
  }>) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }
    return this.prisma.endereco.update({ where: { id }, data });
  }

  async delete(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }
    return this.prisma.endereco.delete({ where: { id } });
  }
}
