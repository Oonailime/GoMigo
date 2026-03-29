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
exports.SolicitacoesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const ownership_utils_1 = require("../auth/ownership.utils");
const prisma_service_1 = require("../prisma/prisma.service");
let SolicitacoesService = class SolicitacoesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findPacoteOrThrow(idPacoteViagem) {
        const pacote = await this.prisma.pacoteViagem.findUnique({ where: { id: idPacoteViagem } });
        if (!pacote) {
            throw new common_1.NotFoundException('pacote nao encontrado');
        }
        return pacote;
    }
    async findPacoteForOrganizerOrThrow(idPacoteViagem, idUserOrganizador, buildForbiddenError) {
        const pacote = await this.findPacoteOrThrow(idPacoteViagem);
        (0, ownership_utils_1.assertOwnership)(pacote.idOrganizador, idUserOrganizador, buildForbiddenError, 'idUserOrganizador');
        return pacote;
    }
    async runSerializableTransaction(fn, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
            try {
                return await this.prisma.$transaction(fn, { isolationLevel: 'Serializable' });
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                    error.code === 'P2034' &&
                    attempt < maxRetries) {
                    continue;
                }
                throw error;
            }
        }
        throw new common_1.ConflictException('conflito de concorrencia, tente novamente');
    }
    async solicitarParticipacao(idPacoteViagem, idUser, data) {
        if (!idPacoteViagem || Number.isNaN(idPacoteViagem)) {
            throw new common_1.BadRequestException('idPacoteViagem invalido');
        }
        (0, ownership_utils_1.assertValidNumericId)(idUser, 'idUser');
        const pacote = await this.findPacoteOrThrow(idPacoteViagem);
        if (pacote.idOrganizador === idUser) {
            throw new common_1.ConflictException('o organizador nao pode solicitar participacao no proprio pacote');
        }
        const existingAccepted = await this.prisma.viajante.findUnique({
            where: {
                idPacoteViagem_idUser: {
                    idPacoteViagem,
                    idUser,
                },
            },
        });
        if (existingAccepted) {
            throw new common_1.ConflictException('usuario ja participa deste pacote');
        }
        try {
            return await this.prisma.solicitacaoParticipacao.create({
                data: {
                    idPacoteViagem,
                    idUser,
                    mensagemSolicitacao: data.mensagemSolicitacao,
                    statusSolicitacao: 'PENDENTE',
                },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new common_1.ConflictException('solicitacao ja existente');
            }
            throw error;
        }
    }
    async aceitarSolicitacao(idSolicitacao, idUserOrganizador) {
        if (!idSolicitacao || Number.isNaN(idSolicitacao)) {
            throw new common_1.BadRequestException('idSolicitacao invalido');
        }
        (0, ownership_utils_1.assertValidNumericId)(idUserOrganizador, 'idUserOrganizador');
        return this.runSerializableTransaction(async (tx) => {
            const solicitacao = await tx.solicitacaoParticipacao.findUnique({
                where: { id: idSolicitacao },
            });
            if (!solicitacao) {
                throw new common_1.NotFoundException('solicitacao nao encontrada');
            }
            if (solicitacao.statusSolicitacao !== 'PENDENTE') {
                throw new common_1.ConflictException('solicitacao ja processada');
            }
            const pacote = await tx.pacoteViagem.findUnique({ where: { id: solicitacao.idPacoteViagem } });
            if (!pacote) {
                throw new common_1.NotFoundException('pacote nao encontrado');
            }
            (0, ownership_utils_1.assertOwnership)(pacote.idOrganizador, idUserOrganizador, () => new common_1.ForbiddenException('apenas o organizador pode aceitar'), 'idUserOrganizador');
            const totalViajantes = await tx.viajante.count({
                where: { idPacoteViagem: pacote.id },
            });
            if (totalViajantes >= pacote.vagas) {
                throw new common_1.ConflictException('pacote sem vagas disponiveis');
            }
            await tx.viajante.create({
                data: {
                    idPacoteViagem: pacote.id,
                    idUser: solicitacao.idUser,
                    statusParticipacao: 'ATIVO',
                    permissao: 'VIAJANTE',
                },
            });
            return tx.solicitacaoParticipacao.update({
                where: { id: solicitacao.id },
                data: {
                    statusSolicitacao: 'ACEITA',
                    dataResposta: new Date(),
                },
            });
        });
    }
    async rejeitarSolicitacao(idSolicitacao, idUserOrganizador, motivoRecusa) {
        if (!idSolicitacao || Number.isNaN(idSolicitacao)) {
            throw new common_1.BadRequestException('idSolicitacao invalido');
        }
        (0, ownership_utils_1.assertValidNumericId)(idUserOrganizador, 'idUserOrganizador');
        const solicitacao = await this.prisma.solicitacaoParticipacao.findUnique({
            where: { id: idSolicitacao },
        });
        if (!solicitacao) {
            throw new common_1.NotFoundException('solicitacao nao encontrada');
        }
        if (solicitacao.statusSolicitacao !== 'PENDENTE') {
            throw new common_1.ConflictException('solicitacao ja processada');
        }
        await this.findPacoteForOrganizerOrThrow(solicitacao.idPacoteViagem, idUserOrganizador, () => new common_1.ForbiddenException('apenas o organizador pode rejeitar'));
        return this.prisma.solicitacaoParticipacao.update({
            where: { id: solicitacao.id },
            data: {
                statusSolicitacao: 'REJEITADA',
                motivoRecusa,
                dataResposta: new Date(),
            },
        });
    }
    async findOne(id) {
        if (!id || Number.isNaN(id)) {
            throw new common_1.BadRequestException('idSolicitacao invalido');
        }
        const solicitacao = await this.prisma.solicitacaoParticipacao.findUnique({ where: { id } });
        if (!solicitacao) {
            throw new common_1.NotFoundException('solicitacao nao encontrada');
        }
        return solicitacao;
    }
    async findOneForUser(id, idUser) {
        (0, ownership_utils_1.assertValidNumericId)(idUser, 'idUser');
        const solicitacao = await this.prisma.solicitacaoParticipacao.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true,
                    },
                },
                pacoteViagem: {
                    select: {
                        id: true,
                        titulo: true,
                        idOrganizador: true,
                    },
                },
            },
        });
        if (!solicitacao) {
            throw new common_1.NotFoundException('solicitacao nao encontrada');
        }
        const canAccess = solicitacao.idUser === idUser || solicitacao.pacoteViagem.idOrganizador === idUser;
        if (!canAccess) {
            throw new common_1.ForbiddenException('usuario nao pode visualizar esta solicitacao');
        }
        return solicitacao;
    }
    async findByPacote(idPacoteViagem, idUserOrganizador) {
        if (!idPacoteViagem || Number.isNaN(idPacoteViagem)) {
            throw new common_1.BadRequestException('idPacoteViagem invalido');
        }
        await this.findPacoteForOrganizerOrThrow(idPacoteViagem, idUserOrganizador, () => new common_1.ForbiddenException('apenas o organizador pode visualizar as solicitacoes'));
        return this.prisma.solicitacaoParticipacao.findMany({
            where: { idPacoteViagem },
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
        });
    }
    async findMine(idUser) {
        (0, ownership_utils_1.assertValidNumericId)(idUser, 'idUser');
        return this.prisma.solicitacaoParticipacao.findMany({
            where: { idUser },
            orderBy: { dataSolicitacao: 'desc' },
            include: {
                pacoteViagem: {
                    select: {
                        id: true,
                        titulo: true,
                        idOrganizador: true,
                    },
                },
            },
        });
    }
    async getNotifications(idUser) {
        (0, ownership_utils_1.assertValidNumericId)(idUser, 'idUser');
        const [organizerNotifications, travelerNotifications, evaluationNotifications] = await Promise.all([
            this.prisma.solicitacaoParticipacao.findMany({
                where: {
                    pacoteViagem: {
                        idOrganizador: idUser,
                    },
                },
                orderBy: [
                    { dataResposta: 'desc' },
                    { dataSolicitacao: 'desc' },
                ],
                take: 20,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    pacoteViagem: {
                        select: {
                            id: true,
                            titulo: true,
                        },
                    },
                },
            }),
            this.prisma.solicitacaoParticipacao.findMany({
                where: {
                    idUser,
                    statusSolicitacao: {
                        in: ['ACEITA', 'REJEITADA'],
                    },
                },
                orderBy: [
                    { dataResposta: 'desc' },
                    { dataSolicitacao: 'desc' },
                ],
                include: {
                    pacoteViagem: {
                        select: {
                            id: true,
                            titulo: true,
                        },
                    },
                },
            }),
            this.prisma.avaliacao.findMany({
                where: {
                    idUserAvaliado: idUser,
                },
                orderBy: {
                    dataAvaliacao: 'desc',
                },
                take: 20,
                include: {
                    autor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    pacoteViagem: {
                        select: {
                            id: true,
                            titulo: true,
                        },
                    },
                },
            }),
        ]);
        return {
            totalPendentes: organizerNotifications.length,
            totalRespostas: travelerNotifications.length,
            totalAvaliacoes: evaluationNotifications.length,
            total: organizerNotifications.length +
                travelerNotifications.length +
                evaluationNotifications.length,
            organizerNotifications,
            travelerNotifications,
            evaluationNotifications,
        };
    }
};
exports.SolicitacoesService = SolicitacoesService;
exports.SolicitacoesService = SolicitacoesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SolicitacoesService);
