import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    cpf: string;
    phoneNumber: string;
    email: string;
    status: string;
    sobreMim?: string;
    personalidade?: string;
    experienciaViagem?: string;
    gostaDeFazer?: string;
  }) {
    return this.prisma.user.create({ data });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('usuario nao encontrado');
    }

    return user;
  }

  async update(
    id: number,
    data: Partial<{
      name: string;
      cpf: string;
      phoneNumber: string;
      email: string;
      status: string;
      sobreMim: string;
      personalidade: string;
      experienciaViagem: string;
      gostaDeFazer: string;
    }>,
  ) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('usuario nao encontrado');
    }

    return this.prisma.user.update({ where: { id }, data });
  }

  async delete(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('usuario nao encontrado');
    }

    return this.prisma.user.delete({ where: { id } });
  }
}
