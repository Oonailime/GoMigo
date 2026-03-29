import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TipoPacoteViagem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertRoteiroDto } from './dto/upsert-roteiro.dto';
import { SearchPacotesDto } from './dto/search-pacotes.dto';

@Injectable()
export class PacotesService {
  constructor(private readonly prisma: PrismaService) {}

  private createAddressData(value?: string) {
    if (!value?.trim()) {
      return null;
    }

    const [cidadePart, estadoPart] = value.split(' - ');
    return {
      rua: 'Nao informado',
      cep: '00000000',
      cidade: cidadePart?.trim() || value.trim(),
      estado: estadoPart?.trim() || 'Nao informado',
    };
  }

  private async getOrCreateEnderecoId(tx: Prisma.TransactionClient, value?: string) {
    const data = this.createAddressData(value);
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
    const timeline = [
      ...caronas.map((item) => ({
        kind: 'CARONA' as const,
        id: item.id,
        title: `${formatCityLabel(item.enderecoPartida)} -> ${formatCityLabel(item.enderecoDestino)}`,
        startsAt: item.dataIda?.toISOString() ?? null,
        endsAt: item.dataVolta?.toISOString() ?? null,
        subtitle: item.regrasCarona,
      })),
      ...hospedagens.map((item) => ({
        kind: 'HOSPEDAGEM' as const,
        id: item.id,
        title: item.nomeLocal ?? 'Hospedagem',
        startsAt: item.dataCheckin?.toISOString() ?? null,
        endsAt: item.dataCheckout?.toISOString() ?? null,
        subtitle: item.endereco ? formatCityLabel(item.endereco) : item.regrasHospedagem,
      })),
      ...atividades.map((item) => ({
        kind: item.categoriaAtividade?.nome === 'Alimentacao' ? ('ALIMENTACAO' as const) : ('PASSEIO_TURISMO' as const),
        id: item.id,
        title: item.titulo,
        startsAt: item.dataHoraInicio.toISOString(),
        endsAt: item.dataHoraFim.toISOString(),
        subtitle: item.endereco ? formatCityLabel(item.endereco) : item.descricao,
      })),
    ].sort((a, b) => {
      const left = a.startsAt ? new Date(a.startsAt).getTime() : Number.MAX_SAFE_INTEGER;
      const right = b.startsAt ? new Date(b.startsAt).getTime() : Number.MAX_SAFE_INTEGER;
      return left - right;
    });

    return {
      packageId: pacote.id,
      viewerRole: pacote.viewerRole,
      canEdit: pacote.viewerRole === 'ORGANIZADOR',
      roteiro: {
        id: roteiro?.id ?? null,
        titulo: roteiro?.titulo ?? 'Roteiro da viagem',
        descricao: roteiro?.descricao ?? null,
      },
      caronas: caronas.map((item) => ({
        id: item.id,
        origem: item.enderecoPartida ? formatCityLabel(item.enderecoPartida) : null,
        destino: item.enderecoDestino ? formatCityLabel(item.enderecoDestino) : null,
        dataIda: item.dataIda?.toISOString() ?? null,
        dataVolta: item.dataVolta?.toISOString() ?? null,
        precoPorPessoa: item.precoPorPessoa ?? null,
        regrasCarona: item.regrasCarona,
        status: item.status,
      })),
      hospedagens: hospedagens.map((item) => ({
        id: item.id,
        nomeLocal: item.nomeLocal ?? null,
        local: item.endereco ? formatCityLabel(item.endereco) : null,
        dataCheckin: item.dataCheckin?.toISOString() ?? null,
        dataCheckout: item.dataCheckout?.toISOString() ?? null,
        precoPorPessoa: item.precoPorPessoa ?? null,
        regrasHospedagem: item.regrasHospedagem,
        statusReserva: item.statusReserva,
      })),
      atividades: atividades.map((item) => ({
        id: item.id,
        categoria:
          item.categoriaAtividade?.nome === 'Alimentacao' ? 'ALIMENTACAO' : 'PASSEIO_TURISMO',
        titulo: item.titulo,
        descricao: item.descricao,
        dataHoraInicio: item.dataHoraInicio.toISOString(),
        dataHoraFim: item.dataHoraFim.toISOString(),
        preco: item.preco ?? null,
        local: item.endereco ? formatCityLabel(item.endereco) : null,
      })),
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
              data: {
                titulo: data.titulo?.trim() || 'Roteiro da viagem',
                descricao: data.descricao?.trim() || null,
              },
            })
          : await tx.roteiro.create({
              data: {
                idPacoteViagem: pacote.id,
                titulo: data.titulo?.trim() || 'Roteiro da viagem',
                descricao: data.descricao?.trim() || null,
              },
            });

      const sentCaronaIds = (data.caronas ?? []).flatMap((item) =>
        typeof item.id === 'number' ? [item.id] : [],
      );
      const sentHospedagemIds = (data.hospedagens ?? []).flatMap((item) =>
        typeof item.id === 'number' ? [item.id] : [],
      );
      const sentAtividadeIds = (data.atividades ?? []).flatMap((item) =>
        typeof item.id === 'number' ? [item.id] : [],
      );

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
        const caronaData = {
          idPacoteViagem: pacote.id,
          idMotorista: idOrganizador,
          dataIda: item.dataIda ? new Date(item.dataIda) : null,
          dataVolta: item.dataVolta ? new Date(item.dataVolta) : null,
          precoPorPessoa: item.precoPorPessoa ?? null,
          idEnderecoPartida: await this.getOrCreateEnderecoId(tx, item.origem),
          idEnderecoDestino: await this.getOrCreateEnderecoId(tx, item.destino),
          regrasCarona: item.regrasCarona?.trim() || 'Horarios e regras a combinar.',
          status: item.status?.trim() || 'PLANEJADA',
        };

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
        const hospedagemData = {
          idPacoteViagem: pacote.id,
          idEndereco: await this.getOrCreateEnderecoId(tx, item.local),
          nomeLocal: item.nomeLocal?.trim() || 'Hospedagem',
          dataCheckin: item.dataCheckin ? new Date(item.dataCheckin) : null,
          dataCheckout: item.dataCheckout ? new Date(item.dataCheckout) : null,
          precoPorPessoa: item.precoPorPessoa ?? null,
          regrasHospedagem: item.regrasHospedagem?.trim() || 'Regras da hospedagem a combinar.',
          statusReserva: item.statusReserva?.trim() || 'PLANEJADA',
        };

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
        const atividadeData = {
          idRoteiro: roteiro.id,
          idCategoriaAtividade: await this.getOrCreateCategoriaAtividadeId(tx, item.categoria),
          idEndereco: await this.getOrCreateEnderecoId(tx, item.local),
          titulo: item.titulo.trim(),
          descricao: item.descricao?.trim() || item.titulo.trim(),
          dataHoraInicio: new Date(item.dataHoraInicio),
          dataHoraFim: new Date(item.dataHoraFim),
          ordem: index + 1,
          preco: item.preco ?? null,
        };

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

function formatCityLabel(value?: { cidade?: string | null; estado?: string | null } | null) {
  if (!value?.cidade) {
    return 'Local a definir';
  }

  if (!value.estado || value.estado === 'Nao informado') {
    return value.cidade;
  }

  return `${value.cidade} - ${value.estado}`;
}
