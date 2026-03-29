import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnuncioDto } from './dto/create-anuncio.dto';
import { UpdateAnuncioDto } from './dto/update-anuncio.dto';

@Injectable()
export class AnunciosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(idOrganizador: number, data: CreateAnuncioDto) {
    if (!idOrganizador || Number.isNaN(idOrganizador)) {
      throw new BadRequestException('idOrganizador invalido');
    }

    const pacote = await this.prisma.pacoteViagem.findUnique({
      where: { id: data.idPacoteViagem },
      select: { id: true, idOrganizador: true },
    });

    if (!pacote) {
      throw new NotFoundException('pacote nao encontrado');
    }

    if (pacote.idOrganizador !== idOrganizador) {
      throw new ForbiddenException('somente o organizador pode criar anuncios para este pacote');
    }

    return this.prisma.anuncioPacote.create({
      data: {
        ...data,
        idOrganizador,
      },
    });
  }

  async findAll() {
    return this.prisma.anuncioPacote.findMany();
  }

  async findOne(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    const anuncio = await this.prisma.anuncioPacote.findUnique({ where: { id } });
    if (!anuncio) {
      throw new NotFoundException('anuncio nao encontrado');
    }

    return anuncio;
  }

  async update(
    idOrganizador: number,
    id: number,
    data: UpdateAnuncioDto,
  ) {
    if (!idOrganizador || Number.isNaN(idOrganizador)) {
      throw new BadRequestException('idOrganizador invalido');
    }

    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    const anuncio = await this.prisma.anuncioPacote.findUnique({
      where: { id },
      select: { id: true, idOrganizador: true },
    });

    if (!anuncio) {
      throw new NotFoundException('anuncio nao encontrado');
    }

    if (anuncio.idOrganizador !== idOrganizador) {
      throw new ForbiddenException('somente o organizador do anuncio pode altera-lo');
    }

    try {
      return await this.prisma.anuncioPacote.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('anuncio nao encontrado');
      }
      throw error;
    }
  }

  async delete(idOrganizador: number, id: number) {
    if (!idOrganizador || Number.isNaN(idOrganizador)) {
      throw new BadRequestException('idOrganizador invalido');
    }

    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    const anuncio = await this.prisma.anuncioPacote.findUnique({
      where: { id },
      select: { id: true, idOrganizador: true },
    });

    if (!anuncio) {
      throw new NotFoundException('anuncio nao encontrado');
    }

    if (anuncio.idOrganizador !== idOrganizador) {
      throw new ForbiddenException('somente o organizador do anuncio pode exclui-lo');
    }

    try {
      return await this.prisma.anuncioPacote.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('anuncio nao encontrado');
      }
      throw error;
    }
  }
}
