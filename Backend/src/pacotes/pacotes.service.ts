import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TipoPacoteViagem } from '@prisma/client';
import { assertOwnership, assertValidNumericId } from '../auth/ownership.utils';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertRoteiroDto } from './dto/upsert-roteiro.dto';
import { SearchPacotesDto } from './dto/search-pacotes.dto';
import { filterTravelerTrips, resolvePackageViewerRole } from './pacotes.access.utils';
import {
  buildItineraryTimeline,
  mapAtividadesForItinerary,
  mapCaronasForItinerary,
  mapHospedagensForItinerary,
  mapRoteiroHeader,
} from './pacotes.itinerary.utils';
import {
  buildAtividadeUpsertData,
  buildCaronaUpsertData,
  buildHospedagemUpsertData,
  collectSentEntityIds,
  normalizeRoteiroMetadata,
} from './pacotes.itinerary-upsert.utils';
import { buildPacoteSearchContext, buildSearchResponse } from './pacotes.search.utils';
import { createAddressData, formatCityLabel } from './pacotes.utils';

@Injectable()
export class PacotesService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreateEnderecoId(tx: Prisma.TransactionClient, value?: string) {
    const data = createAddressData(value);
    if (!data) {
      return null;
    }

    const existing = await tx.endereco.findFirst({
      where: {
        cidade: data.cidade,
        estado: data.estado,
      },
      select: { id: true },
    });

    if (existing) {
      return existing.id;
    }

    const created = await tx.endereco.create({ data });
    return created.id;
  }

  private async getOrCreateCategoriaAtividadeId(
    tx: Prisma.TransactionClient,
    categoria: 'PASSEIO_TURISMO' | 'ALIMENTACAO',
  ) {
    const nome =
      categoria === 'ALIMENTACAO' ? 'Alimentacao' : 'Passeio/Turismo';

    const existing = await tx.categoriaAtividade.findUnique({
      where: { nome },
      select: { id: true },
    });

    if (existing) {
      return existing.id;
    }

    const created = await tx.categoriaAtividade.create({
      data: {
        nome,
        descricao:
          categoria === 'ALIMENTACAO'
            ? 'Paradas e programacoes de refeicao da viagem'
            : 'Passeios, visitas e programacoes turisticas da viagem',
      },
      select: { id: true },
    });

    return created.id;
  }

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
    assertValidNumericId(idUser, 'idUser');

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

    return {
      asOrganizer,
      asTraveler: filterTravelerTrips(asOrganizer, asTraveler),
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
    assertValidNumericId(idOrganizador, 'idOrganizador');

    const pacote = await this.findOne(id);

    assertOwnership(
      pacote.idOrganizador,
      idOrganizador,
      () => new NotFoundException('pacote nao encontrado para este organizador'),
    );

    return pacote;
  }

  async findOneForParticipant(id: number, idUser: number) {
    assertValidNumericId(idUser, 'idUser');

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

    const viewerRole = resolvePackageViewerRole(pacote, idUser);

    if (!viewerRole) {
      throw new NotFoundException('pacote nao encontrado para este usuario');
    }

    return {
      ...pacote,
      viewerRole,
    };
  }

  async findItineraryForParticipant(id: number, idUser: number) {
    const pacote = await this.findOneForParticipant(id, idUser);

    const [caronas, hospedagens, roteiros] = await Promise.all([
      this.prisma.carona.findMany({
        where: { idPacoteViagem: pacote.id },
        orderBy: [{ dataIda: 'asc' }, { id: 'asc' }],
        include: {
          enderecoPartida: {
            select: {
              cidade: true,
              estado: true,
            },
          },
          enderecoDestino: {
            select: {
              cidade: true,
              estado: true,
            },
          },
        },
      }),
      this.prisma.hospedagem.findMany({
        where: { idPacoteViagem: pacote.id },
        orderBy: [{ dataCheckin: 'asc' }, { id: 'asc' }],
        include: {
          endereco: {
            select: {
              cidade: true,
              estado: true,
            },
          },
        },
      }),
      this.prisma.roteiro.findMany({
        where: { idPacoteViagem: pacote.id },
        orderBy: { id: 'asc' },
        include: {
          atividades: {
            orderBy: [{ dataHoraInicio: 'asc' }, { ordem: 'asc' }, { id: 'asc' }],
            include: {
              categoriaAtividade: {
                select: {
                  nome: true,
                },
              },
              endereco: {
                select: {
                  cidade: true,
                  estado: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const roteiro = roteiros[0] ?? null;
    const atividades = roteiro?.atividades ?? [];
    const timeline = buildItineraryTimeline(caronas, hospedagens, atividades);

    return {
      packageId: pacote.id,
      viewerRole: pacote.viewerRole,
      canEdit: pacote.viewerRole === 'ORGANIZADOR',
      roteiro: mapRoteiroHeader(roteiro),
      caronas: mapCaronasForItinerary(caronas),
      hospedagens: mapHospedagensForItinerary(hospedagens),
      atividades: mapAtividadesForItinerary(atividades),
      timeline,
    };
  }

  async upsertItinerary(id: number, idOrganizador: number, data: UpsertRoteiroDto) {
    const pacote = await this.findOneForOrganizador(id, idOrganizador);

    await this.prisma.$transaction(async (tx) => {
      const existingRoteiro = await tx.roteiro.findFirst({
        where: { idPacoteViagem: pacote.id },
        select: { id: true },
      });

      const roteiro =
        existingRoteiro
          ? await tx.roteiro.update({
              where: { id: existingRoteiro.id },
              data: normalizeRoteiroMetadata(data),
            })
          : await tx.roteiro.create({
              data: {
                idPacoteViagem: pacote.id,
                ...normalizeRoteiroMetadata(data),
              },
            });

      const sentCaronaIds = collectSentEntityIds(data.caronas);
      const sentHospedagemIds = collectSentEntityIds(data.hospedagens);
      const sentAtividadeIds = collectSentEntityIds(data.atividades);

      await tx.carona.deleteMany({
        where: {
          idPacoteViagem: pacote.id,
          ...(sentCaronaIds.length > 0 ? { id: { notIn: sentCaronaIds } } : {}),
        },
      });
      await tx.hospedagem.deleteMany({
        where: {
          idPacoteViagem: pacote.id,
          ...(sentHospedagemIds.length > 0 ? { id: { notIn: sentHospedagemIds } } : {}),
        },
      });
      await tx.atividade.deleteMany({
        where: {
          idRoteiro: roteiro.id,
          ...(sentAtividadeIds.length > 0 ? { id: { notIn: sentAtividadeIds } } : {}),
        },
      });

      for (const item of data.caronas ?? []) {
        const caronaData = buildCaronaUpsertData(
          item,
          pacote.id,
          idOrganizador,
          await this.getOrCreateEnderecoId(tx, item.origem),
          await this.getOrCreateEnderecoId(tx, item.destino),
        );

        if (item.id) {
          await tx.carona.update({
            where: { id: item.id },
            data: caronaData,
          });
        } else {
          await tx.carona.create({ data: caronaData });
        }
      }

      for (const item of data.hospedagens ?? []) {
        const hospedagemData = buildHospedagemUpsertData(
          item,
          pacote.id,
          await this.getOrCreateEnderecoId(tx, item.local),
        );

        if (item.id) {
          await tx.hospedagem.update({
            where: { id: item.id },
            data: hospedagemData,
          });
        } else {
          await tx.hospedagem.create({ data: hospedagemData });
        }
      }

      for (const [index, item] of (data.atividades ?? []).entries()) {
        const atividadeData = buildAtividadeUpsertData(
          item,
          roteiro.id,
          await this.getOrCreateCategoriaAtividadeId(tx, item.categoria),
          await this.getOrCreateEnderecoId(tx, item.local),
          index + 1,
        );

        if (item.id) {
          await tx.atividade.update({
            where: { id: item.id },
            data: atividadeData,
          });
        } else {
          await tx.atividade.create({ data: atividadeData });
        }
      }

    });

    return this.findItineraryForParticipant(pacote.id, idOrganizador);
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

  async updateForOrganizador(
    id: number,
    idOrganizador: number,
    data: Prisma.PacoteViagemUncheckedUpdateInput,
  ) {
    await this.findOneForOrganizador(id, idOrganizador);
    return this.update(id, data);
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
    await this.findOneForOrganizador(id, idOrganizador);
    return this.delete(id);
  }

  async cancelReservation(id: number, idUser: number) {
    assertValidNumericId(idUser, 'idUser');

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
    const { dataInicio, dataFim, page, pageSize, baseWhere, pagination } =
      buildPacoteSearchContext(today, dto);

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

    if (!dataInicio || !dataFim) {
      const [pacotes, total] = await Promise.all([
        this.prisma.pacoteViagem.findMany({
          where: baseWhere,
          include,
          ...pagination,
        }),
        this.prisma.pacoteViagem.count({ where: baseWhere }),
      ]);

      return buildSearchResponse(
        pacotes.length > 0 ? 'EXATO' : 'SEM_RESULTADOS',
        page,
        pageSize,
        total,
        await this.attachOrganizerPublicRatings(pacotes),
        pacotes.length > 0
          ? 'Mostrando todos os pacotes publicados para os filtros atuais.'
          : 'Nao ha pacotes disponiveis para este filtro. Considere criar um novo pacote.',
      );
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

      return buildSearchResponse(
        'EXATO',
        page,
        pageSize,
        exactTotal,
        await this.attachOrganizerPublicRatings(pacotes),
      );
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

      return buildSearchResponse(
        'INTERSECCAO',
        page,
        pageSize,
        overlapTotal,
        await this.attachOrganizerPublicRatings(pacotes),
        'Nao ha pacotes no periodo exato, mostrando datas proximas.',
      );
    }

    return buildSearchResponse(
      'SEM_RESULTADOS',
      page,
      pageSize,
      0,
      [],
      'Nao ha pacotes disponiveis para este filtro. Considere criar um novo pacote.',
    );
  }
}
