import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TipoPacoteViagem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SearchPacotesDto } from './dto/search-pacotes.dto';

@Injectable()
export class PacotesService {
  constructor(private readonly prisma: PrismaService) {}

  private getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  private getTodayDate() {
    return new Date(`${this.getTodayKey()}T00:00:00.000Z`);
  }

  private async attachOrganizerPublicRatings<
    T extends { idOrganizador: number; organizador?: { id: number; name: string | null } | null }
  >(pacotes: T[]) {
    if (pacotes.length === 0) {
      return pacotes;
    }

    const organizerIds = Array.from(new Set(pacotes.map((pacote) => pacote.idOrganizador)));
    const ratings = await this.prisma.avaliacao.groupBy({
      by: ['idUserAvaliado'],
      where: {
        idUserAvaliado: { in: organizerIds },
      },
      _avg: {
        nota: true,
      },
      _count: {
        _all: true,
      },
    });

    const ratingsMap = new Map(
      ratings.map((rating) => [
        rating.idUserAvaliado,
        {
          media: rating._avg.nota ?? null,
          total: rating._count._all,
        },
      ]),
    );

    return pacotes.map((pacote) => ({
      ...pacote,
      organizador: pacote.organizador
        ? {
            ...pacote.organizador,
            ratingMedia: ratingsMap.get(pacote.idOrganizador)?.media ?? null,
            totalAvaliacoes: ratingsMap.get(pacote.idOrganizador)?.total ?? 0,
          }
        : pacote.organizador,
    }));
  }

  async create(data: Prisma.PacoteViagemUncheckedCreateInput) {
    return this.prisma.pacoteViagem.create({ data });
  }

  async findAll() {
    return this.prisma.pacoteViagem.findMany();
  }

  async findByOrganizador(idOrganizador: number) {
    if (!idOrganizador || Number.isNaN(idOrganizador)) {
      throw new BadRequestException('idOrganizador invalido');
    }

    return this.prisma.pacoteViagem.findMany({
      where: { idOrganizador },
      orderBy: { dataCriacao: 'desc' },
      include: {
        enderecoPartida: true,
        enderecoDestino: true,
        solicitacoesParticipacao: {
          orderBy: { dataSolicitacao: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
        viajantes: {
          where: {
            statusParticipacao: 'ATIVO',
          },
        },
      },
    });
  }

  async findTripsForUser(idUser: number) {
    if (!idUser || Number.isNaN(idUser)) {
      throw new BadRequestException('idUser invalido');
    }

    const [asOrganizer, asTraveler] = await Promise.all([
      this.prisma.pacoteViagem.findMany({
        where: { idOrganizador: idUser },
        orderBy: { dataCriacao: 'desc' },
        include: {
          enderecoPartida: true,
          enderecoDestino: true,
        },
      }),
      this.prisma.pacoteViagem.findMany({
        where: {
          viajantes: {
            some: {
              idUser,
              statusParticipacao: 'ATIVO',
            },
          },
        },
        orderBy: { dataCriacao: 'desc' },
        include: {
          enderecoPartida: true,
          enderecoDestino: true,
        },
      }),
    ]);

    const organizerIds = new Set(asOrganizer.map((item) => item.id));

    return {
      asOrganizer,
      asTraveler: asTraveler.filter((item) => !organizerIds.has(item.id)),
    };
  }

  async findOne(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    const pacote = await this.prisma.pacoteViagem.findUnique({
      where: { id },
      include: {
        enderecoPartida: true,
        enderecoDestino: true,
      },
    });
    if (!pacote) {
      throw new NotFoundException('pacote nao encontrado');
    }

    return pacote;
  }

  async findOneForOrganizador(id: number, idOrganizador: number) {
    if (!idOrganizador || Number.isNaN(idOrganizador)) {
      throw new BadRequestException('idOrganizador invalido');
    }

    const pacote = await this.findOne(id);

    if (pacote.idOrganizador !== idOrganizador) {
      throw new NotFoundException('pacote nao encontrado para este organizador');
    }

    return pacote;
  }

  async findOneForParticipant(id: number, idUser: number) {
    if (!idUser || Number.isNaN(idUser)) {
      throw new BadRequestException('idUser invalido');
    }

    const pacote = await this.prisma.pacoteViagem.findUnique({
      where: { id },
      include: {
        enderecoPartida: true,
        enderecoDestino: true,
        organizador: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        viajantes: {
          where: {
            statusParticipacao: 'ATIVO',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });

    if (!pacote) {
      throw new NotFoundException('pacote nao encontrado');
    }

    const isParticipant =
      pacote.idOrganizador === idUser ||
      pacote.viajantes.some((viajante) => viajante.idUser === idUser);

    if (!isParticipant) {
      throw new NotFoundException('pacote nao encontrado para este usuario');
    }

    return {
      ...pacote,
      viewerRole: pacote.idOrganizador === idUser ? 'ORGANIZADOR' : 'VIAJANTE',
    };
  }

  async update(id: number, data: Prisma.PacoteViagemUncheckedUpdateInput) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    const existing = await this.prisma.pacoteViagem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('pacote nao encontrado');
    }

    return this.prisma.pacoteViagem.update({ where: { id }, data });
  }

  async delete(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('id invalido');
    }

    const existing = await this.prisma.pacoteViagem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('pacote nao encontrado');
    }

    return this.prisma.pacoteViagem.delete({ where: { id } });
  }

  async deleteForOrganizador(id: number, idOrganizador: number) {
    if (!idOrganizador || Number.isNaN(idOrganizador)) {
      throw new BadRequestException('idOrganizador invalido');
    }

    const pacote = await this.findOne(id);
    if (pacote.idOrganizador !== idOrganizador) {
      throw new NotFoundException('pacote nao encontrado para este organizador');
    }

    return this.delete(id);
  }

  async cancelReservation(id: number, idUser: number) {
    if (!idUser || Number.isNaN(idUser)) {
      throw new BadRequestException('idUser invalido');
    }

    const pacote = await this.findOne(id);
    if (pacote.idOrganizador === idUser) {
      throw new BadRequestException('o organizador deve cancelar o pacote inteiro');
    }

    const viajante = await this.prisma.viajante.findUnique({
      where: {
        idPacoteViagem_idUser: {
          idPacoteViagem: id,
          idUser,
        },
      },
    });

    if (!viajante || viajante.statusParticipacao !== 'ATIVO') {
      throw new NotFoundException('reserva nao encontrada para este usuario');
    }

    await this.prisma.viajante.delete({
      where: {
        idPacoteViagem_idUser: {
          idPacoteViagem: id,
          idUser,
        },
      },
    });

    return {
      success: true,
      message: 'reserva cancelada com sucesso',
    };
  }

  async listarAnunciados() {
    const today = this.getTodayDate();

    return this.prisma.pacoteViagem.findMany({
      where: {
        privacidade: { not: 'PRIVADO' },
        dataInicio: { not: null, gte: today },
        anuncios: {
          some: {
            statusAnuncio: 'ATIVO',
          },
        },
      },
      include: {
        anuncios: true,
      },
    });
  }

  async search(dto: SearchPacotesDto) {
    const today = this.getTodayDate();
    const dataInicio = dto.dataInicio;
    const dataFim = dto.dataFim;

    if (dataInicio && dataFim && dataInicio > dataFim) {
      throw new BadRequestException('dataInicio nao pode ser maior que dataFim');
    }

    const cidadePartida = dto.cidadePartida?.split(' - ')[0]?.trim() ?? dto.cidadePartida;
    const cidadeDestino = dto.cidadeDestino?.split(' - ')[0]?.trim() ?? dto.cidadeDestino;
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? 12;

    const baseWhere: Prisma.PacoteViagemWhereInput = {
      status: 'ATIVO',
      privacidade: { not: 'PRIVADO' },
      dataInicio: { not: null, gte: today },
    };

    if (dto.tipo) {
      baseWhere.tipoPacoteViagem = dto.tipo as TipoPacoteViagem;
    }

    if (cidadePartida) {
      baseWhere.enderecoPartida = {
        cidade: { contains: cidadePartida, mode: 'insensitive' },
      };
    }

    if (cidadeDestino) {
      baseWhere.enderecoDestino = {
        cidade: { contains: cidadeDestino, mode: 'insensitive' },
      };
    }

    const include = {
      enderecoPartida: true,
      enderecoDestino: true,
      organizador: {
        select: {
          id: true,
          name: true,
        },
      },
    } as const;

    const pagination = {
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { dataCriacao: 'desc' as const },
    };

    if (!dataInicio || !dataFim) {
      const [pacotes, total] = await Promise.all([
        this.prisma.pacoteViagem.findMany({
          where: baseWhere,
          include,
          ...pagination,
        }),
        this.prisma.pacoteViagem.count({ where: baseWhere }),
      ]);

      return {
        modo: pacotes.length > 0 ? 'EXATO' : 'SEM_RESULTADOS',
        mensagem:
          pacotes.length > 0
            ? 'Mostrando todos os pacotes publicados para os filtros atuais.'
            : 'Nao ha pacotes disponiveis para este filtro. Considere criar um novo pacote.',
        pacotes: await this.attachOrganizerPublicRatings(pacotes),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
      };
    }

    const exactWhere: Prisma.PacoteViagemWhereInput = {
      ...baseWhere,
      dataInicio: { not: null, gte: dataInicio },
      dataFim: { not: null, lte: dataFim },
    };

    const exactTotal = await this.prisma.pacoteViagem.count({ where: exactWhere });
    if (exactTotal > 0) {
      const pacotes = await this.prisma.pacoteViagem.findMany({
        where: exactWhere,
        include,
        ...pagination,
      });

      return {
        modo: 'EXATO',
        pacotes: await this.attachOrganizerPublicRatings(pacotes),
        pagination: {
          page,
          pageSize,
          total: exactTotal,
          totalPages: Math.max(1, Math.ceil(exactTotal / pageSize)),
        },
      };
    }

    const overlapWhere: Prisma.PacoteViagemWhereInput = {
      ...baseWhere,
      dataInicio: { not: null, lte: dataFim },
      dataFim: { not: null, gte: dataInicio },
    };

    const overlapTotal = await this.prisma.pacoteViagem.count({ where: overlapWhere });
    if (overlapTotal > 0) {
      const pacotes = await this.prisma.pacoteViagem.findMany({
        where: overlapWhere,
        include,
        ...pagination,
      });

      return {
        modo: 'INTERSECCAO',
        mensagem: 'Nao ha pacotes no periodo exato, mostrando datas proximas.',
        pacotes: await this.attachOrganizerPublicRatings(pacotes),
        pagination: {
          page,
          pageSize,
          total: overlapTotal,
          totalPages: Math.max(1, Math.ceil(overlapTotal / pageSize)),
        },
      };
    }

    return {
      modo: 'SEM_RESULTADOS',
      mensagem: 'Nao ha pacotes disponiveis para este filtro. Considere criar um novo pacote.',
      pacotes: [],
      pagination: {
        page,
        pageSize,
        total: 0,
        totalPages: 1,
      },
    };
  }
}
