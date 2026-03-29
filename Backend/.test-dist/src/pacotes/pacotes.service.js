"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacotesService = void 0;
const common_1 = require("@nestjs/common");
const ownership_utils_1 = require("../auth/ownership.utils");
const prisma_service_1 = require("../prisma/prisma.service");
const pacotes_access_utils_1 = require("./pacotes.access.utils");
const pacotes_itinerary_utils_1 = require("./pacotes.itinerary.utils");
const pacotes_itinerary_upsert_utils_1 = require("./pacotes.itinerary-upsert.utils");
const pacotes_search_utils_1 = require("./pacotes.search.utils");
const pacotes_utils_1 = require("./pacotes.utils");
let PacotesService = class PacotesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreateEnderecoId(tx, value) {
        const data = (0, pacotes_utils_1.createAddressData)(value);
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
    async getOrCreateCategoriaAtividadeId(tx, categoria) {
        const nome = categoria === 'ALIMENTACAO' ? 'Alimentacao' : 'Passeio/Turismo';
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
                descricao: categoria === 'ALIMENTACAO'
                    ? 'Paradas e programacoes de refeicao da viagem'
                    : 'Passeios, visitas e programacoes turisticas da viagem',
            },
            select: { id: true },
        });
        return created.id;
    }
    getTodayKey() {
        return new Date().toISOString().slice(0, 10);
    }
    getTodayDate() {
        return new Date(`${this.getTodayKey()}T00:00:00.000Z`);
    }
    async attachOrganizerPublicRatings(pacotes) {
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
        const ratingsMap = new Map(ratings.map((rating) => [
            rating.idUserAvaliado,
            {
                media: rating._avg.nota ?? null,
                total: rating._count._all,
            },
        ]));
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
    async create(data) {
        return this.prisma.pacoteViagem.create({ data });
    }
    async findAll() {
        return this.prisma.pacoteViagem.findMany();
    }
    async findByOrganizador(idOrganizador) {
        if (!idOrganizador || Number.isNaN(idOrganizador)) {
            throw new common_1.BadRequestException('idOrganizador invalido');
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
    async findTripsForUser(idUser) {
        (0, ownership_utils_1.assertValidNumericId)(idUser, 'idUser');
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
            asTraveler: (0, pacotes_access_utils_1.filterTravelerTrips)(asOrganizer, asTraveler),
        };
    }
    async findOne(id) {
        if (!id || Number.isNaN(id)) {
            throw new common_1.BadRequestException('id invalido');
        }
        const pacote = await this.prisma.pacoteViagem.findUnique({
            where: { id },
            include: {
                enderecoPartida: true,
                enderecoDestino: true,
            },
        });
        if (!pacote) {
            throw new common_1.NotFoundException('pacote nao encontrado');
        }
        return pacote;
    }
    async findOneForOrganizador(id, idOrganizador) {
        (0, ownership_utils_1.assertValidNumericId)(idOrganizador, 'idOrganizador');
        const pacote = await this.findOne(id);
        (0, ownership_utils_1.assertOwnership)(pacote.idOrganizador, idOrganizador, () => new common_1.NotFoundException('pacote nao encontrado para este organizador'));
        return pacote;
    }
    async findOneForParticipant(id, idUser) {
        (0, ownership_utils_1.assertValidNumericId)(idUser, 'idUser');
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
            throw new common_1.NotFoundException('pacote nao encontrado');
        }
        const viewerRole = (0, pacotes_access_utils_1.resolvePackageViewerRole)(pacote, idUser);
        if (!viewerRole) {
            throw new common_1.NotFoundException('pacote nao encontrado para este usuario');
        }
        return {
            ...pacote,
            viewerRole,
        };
    }
    async findItineraryForParticipant(id, idUser) {
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
        const timeline = (0, pacotes_itinerary_utils_1.buildItineraryTimeline)(caronas, hospedagens, atividades);
        return {
            packageId: pacote.id,
            viewerRole: pacote.viewerRole,
            canEdit: pacote.viewerRole === 'ORGANIZADOR',
            roteiro: (0, pacotes_itinerary_utils_1.mapRoteiroHeader)(roteiro),
            caronas: (0, pacotes_itinerary_utils_1.mapCaronasForItinerary)(caronas),
            hospedagens: (0, pacotes_itinerary_utils_1.mapHospedagensForItinerary)(hospedagens),
            atividades: (0, pacotes_itinerary_utils_1.mapAtividadesForItinerary)(atividades),
            timeline,
        };
    }
    async upsertItinerary(id, idOrganizador, data) {
        const pacote = await this.findOneForOrganizador(id, idOrganizador);
        await this.prisma.$transaction(async (tx) => {
            const existingRoteiro = await tx.roteiro.findFirst({
                where: { idPacoteViagem: pacote.id },
                select: { id: true },
            });
            const roteiro = existingRoteiro
                ? await tx.roteiro.update({
                    where: { id: existingRoteiro.id },
                    data: (0, pacotes_itinerary_upsert_utils_1.normalizeRoteiroMetadata)(data),
                })
                : await tx.roteiro.create({
                    data: {
                        idPacoteViagem: pacote.id,
                        ...(0, pacotes_itinerary_upsert_utils_1.normalizeRoteiroMetadata)(data),
                    },
                });
            const sentCaronaIds = (0, pacotes_itinerary_upsert_utils_1.collectSentEntityIds)(data.caronas);
            const sentHospedagemIds = (0, pacotes_itinerary_upsert_utils_1.collectSentEntityIds)(data.hospedagens);
            const sentAtividadeIds = (0, pacotes_itinerary_upsert_utils_1.collectSentEntityIds)(data.atividades);
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
                const caronaData = (0, pacotes_itinerary_upsert_utils_1.buildCaronaUpsertData)(item, pacote.id, idOrganizador, await this.getOrCreateEnderecoId(tx, item.origem), await this.getOrCreateEnderecoId(tx, item.destino));
                if (item.id) {
                    await tx.carona.update({
                        where: { id: item.id },
                        data: caronaData,
                    });
                }
                else {
                    await tx.carona.create({ data: caronaData });
                }
            }
            for (const item of data.hospedagens ?? []) {
                const hospedagemData = (0, pacotes_itinerary_upsert_utils_1.buildHospedagemUpsertData)(item, pacote.id, await this.getOrCreateEnderecoId(tx, item.local));
                if (item.id) {
                    await tx.hospedagem.update({
                        where: { id: item.id },
                        data: hospedagemData,
                    });
                }
                else {
                    await tx.hospedagem.create({ data: hospedagemData });
                }
            }
            for (const [index, item] of (data.atividades ?? []).entries()) {
                const atividadeData = (0, pacotes_itinerary_upsert_utils_1.buildAtividadeUpsertData)(item, roteiro.id, await this.getOrCreateCategoriaAtividadeId(tx, item.categoria), await this.getOrCreateEnderecoId(tx, item.local), index + 1);
                if (item.id) {
                    await tx.atividade.update({
                        where: { id: item.id },
                        data: atividadeData,
                    });
                }
                else {
                    await tx.atividade.create({ data: atividadeData });
                }
            }
        });
        return this.findItineraryForParticipant(pacote.id, idOrganizador);
    }
    async update(id, data) {
        if (!id || Number.isNaN(id)) {
            throw new common_1.BadRequestException('id invalido');
        }
        const existing = await this.prisma.pacoteViagem.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException('pacote nao encontrado');
        }
        return this.prisma.pacoteViagem.update({ where: { id }, data });
    }
    async updateForOrganizador(id, idOrganizador, data) {
        await this.findOneForOrganizador(id, idOrganizador);
        return this.update(id, data);
    }
    async delete(id) {
        if (!id || Number.isNaN(id)) {
            throw new common_1.BadRequestException('id invalido');
        }
        const existing = await this.prisma.pacoteViagem.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException('pacote nao encontrado');
        }
        return this.prisma.pacoteViagem.delete({ where: { id } });
    }
    async deleteForOrganizador(id, idOrganizador) {
        await this.findOneForOrganizador(id, idOrganizador);
        return this.delete(id);
    }
    async cancelReservation(id, idUser) {
        (0, ownership_utils_1.assertValidNumericId)(idUser, 'idUser');
        const pacote = await this.findOne(id);
        if (pacote.idOrganizador === idUser) {
            throw new common_1.BadRequestException('o organizador deve cancelar o pacote inteiro');
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
            throw new common_1.NotFoundException('reserva nao encontrada para este usuario');
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
    async search(dto) {
        const today = this.getTodayDate();
        const { dataInicio, dataFim, page, pageSize, baseWhere, pagination } = (0, pacotes_search_utils_1.buildPacoteSearchContext)(today, dto);
        const include = {
            enderecoPartida: true,
            enderecoDestino: true,
            organizador: {
                select: {
                    id: true,
                    name: true,
                },
            },
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
            return (0, pacotes_search_utils_1.buildSearchResponse)(pacotes.length > 0 ? 'EXATO' : 'SEM_RESULTADOS', page, pageSize, total, await this.attachOrganizerPublicRatings(pacotes), pacotes.length > 0
                ? 'Mostrando todos os pacotes publicados para os filtros atuais.'
                : 'Nao ha pacotes disponiveis para este filtro. Considere criar um novo pacote.');
        }
        const exactWhere = {
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
            return (0, pacotes_search_utils_1.buildSearchResponse)('EXATO', page, pageSize, exactTotal, await this.attachOrganizerPublicRatings(pacotes));
        }
        const overlapWhere = {
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
            return (0, pacotes_search_utils_1.buildSearchResponse)('INTERSECCAO', page, pageSize, overlapTotal, await this.attachOrganizerPublicRatings(pacotes), 'Nao ha pacotes no periodo exato, mostrando datas proximas.');
        }
        return (0, pacotes_search_utils_1.buildSearchResponse)('SEM_RESULTADOS', page, pageSize, 0, [], 'Nao ha pacotes disponiveis para este filtro. Considere criar um novo pacote.');
    }
};
exports.PacotesService = PacotesService;
exports.PacotesService = PacotesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PacotesService);
