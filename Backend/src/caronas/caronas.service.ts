import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

  private async ensureOrganizerOwnsPackage(idPacoteViagem: number, idOrganizador: number) {
    const pacote = await this.prisma.pacoteViagem.findUnique({
      where: { id: idPacoteViagem },
      select: { id: true, idOrganizador: true },
    });

    if (!pacote) {
      throw new NotFoundException('pacote nao encontrado');
    }

    if (pacote.idOrganizador !== idOrganizador) {
      throw new ForbiddenException('apenas o organizador do pacote pode gerenciar caronas');
    }

    return pacote;
  }

  async createForOrganizer(
    idOrganizador: number,
    data: {
      idPacoteViagem: number;
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
    },
  ) {
    await this.ensureOrganizerOwnsPackage(data.idPacoteViagem, idOrganizador);

    return this.prisma.carona.create({
      data: {
        ...data,
        idMotorista: idOrganizador,
      },
    });
  }

  async findAll() {
    return this.prisma.carona.findMany();
  }

  async findByOrganizer(idOrganizador: number) {
    return this.prisma.carona.findMany({
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

    const carona = await this.prisma.carona.findUnique({ where: { id } });
    if (!carona) {
      throw new NotFoundException('carona nao encontrada');
    }

    return carona;
  }

  async findOneForOrganizer(id: number, idOrganizador: number) {
    const carona = await this.prisma.carona.findUnique({
      where: { id },
      include: {
        pacoteViagem: {
          select: {
            idOrganizador: true,
          },
        },
      },
    });

    if (!carona) {
      throw new NotFoundException('carona nao encontrada');
    }

    if (carona.pacoteViagem.idOrganizador !== idOrganizador) {
      throw new ForbiddenException('usuario nao pode acessar esta carona');
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

  async updateForOrganizer(
    id: number,
    idOrganizador: number,
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
    await this.findOneForOrganizer(id, idOrganizador);
    return this.update(id, data);
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

  async deleteForOrganizer(id: number, idOrganizador: number) {
    await this.findOneForOrganizer(id, idOrganizador);
    return this.delete(id);
  }
}
