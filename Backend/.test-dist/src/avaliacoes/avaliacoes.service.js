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
exports.AvaliacoesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let AvaliacoesService = class AvaliacoesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getTodayKey() {
        return new Date().toISOString().slice(0, 10);
    }
    canEvaluatePackage(pacote) {
        if (pacote.status === 'FINALIZADO') {
            return true;
        }
        if (!pacote.dataFim) {
            return false;
        }
        return this.getTodayKey() > pacote.dataFim.toISOString().slice(0, 10);
    }
    async criar(data) {
        if (!data.idUserAutor || Number.isNaN(data.idUserAutor)) {
            throw new common_1.BadRequestException('idUserAutor invalido');
        }
        if (!data.idPacoteViagem || Number.isNaN(data.idPacoteViagem)) {
            throw new common_1.BadRequestException('idPacoteViagem invalido');
        }
        const pacote = await this.prisma.pacoteViagem.findUnique({ where: { id: data.idPacoteViagem } });
        if (!pacote) {
            throw new common_1.NotFoundException('pacote nao encontrado');
        }
        if (!this.canEvaluatePackage(pacote)) {
            throw new common_1.ForbiddenException('pacote ainda nao elegivel para avaliacao');
        }
        const autorEhOrganizador = pacote.idOrganizador === data.idUserAutor;
        const autorEhViajante = await this.prisma.viajante.findUnique({
            where: {
                idPacoteViagem_idUser: {
                    idPacoteViagem: data.idPacoteViagem,
                    idUser: data.idUserAutor,
                },
            },
        });
        if (!autorEhOrganizador && (!autorEhViajante || autorEhViajante.statusParticipacao !== 'ATIVO')) {
            throw new common_1.ForbiddenException('autor nao participa do pacote');
        }
        if (data.tipo === 'PACOTE') {
            const existente = await this.prisma.avaliacao.findFirst({
                where: {
                    idPacoteViagem: data.idPacoteViagem,
                    idUserAutor: data.idUserAutor,
                    tipo: 'PACOTE',
                },
            });
            if (existente) {
                throw new common_1.ConflictException('avaliacao do pacote ja realizada');
            }
            return this.prisma.avaliacao.create({
                data: {
                    idPacoteViagem: data.idPacoteViagem,
                    idUserAutor: data.idUserAutor,
                    nota: data.nota,
                    comentario: data.comentario,
                    tipo: 'PACOTE',
                },
            });
        }
        if (!data.idUserAvaliado || Number.isNaN(data.idUserAvaliado)) {
            throw new common_1.BadRequestException('idUserAvaliado invalido');
        }
        if (data.idUserAvaliado === data.idUserAutor) {
            throw new common_1.BadRequestException('autor nao pode avaliar a si mesmo');
        }
        if (data.tipo === 'ORGANIZADOR') {
            if (data.idUserAvaliado !== pacote.idOrganizador) {
                throw new common_1.ForbiddenException('avaliacao deve ser do organizador do pacote');
            }
            if (autorEhOrganizador) {
                throw new common_1.BadRequestException('organizador nao pode se avaliar');
            }
            try {
                return await this.prisma.avaliacao.create({
                    data: {
                        idPacoteViagem: data.idPacoteViagem,
                        idUserAutor: data.idUserAutor,
                        idUserAvaliado: data.idUserAvaliado,
                        nota: data.nota,
                        comentario: data.comentario,
                        tipo: 'ORGANIZADOR',
                    },
                });
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                    throw new common_1.ConflictException('avaliacao do organizador ja realizada');
                }
                throw error;
            }
        }
        if (data.tipo === 'VIAJANTE') {
            if (data.idUserAvaliado === pacote.idOrganizador) {
                throw new common_1.ForbiddenException('organizador so pode ser avaliado como organizador');
            }
            const alvoViajante = await this.prisma.viajante.findUnique({
                where: {
                    idPacoteViagem_idUser: {
                        idPacoteViagem: data.idPacoteViagem,
                        idUser: data.idUserAvaliado,
                    },
                },
            });
            if (!alvoViajante || alvoViajante.statusParticipacao !== 'ATIVO') {
                throw new common_1.ForbiddenException('usuario avaliado nao eh viajante do pacote');
            }
            try {
                return await this.prisma.avaliacao.create({
                    data: {
                        idPacoteViagem: data.idPacoteViagem,
                        idUserAutor: data.idUserAutor,
                        idUserAvaliado: data.idUserAvaliado,
                        nota: data.nota,
                        comentario: data.comentario,
                        tipo: 'VIAJANTE',
                    },
                });
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                    throw new common_1.ConflictException('avaliacao do viajante ja realizada');
                }
                throw error;
            }
        }
        throw new common_1.BadRequestException('tipo de avaliacao invalido');
    }
    async listarPendentes(idPacoteViagem, idUserAutor) {
        if (!idPacoteViagem || Number.isNaN(idPacoteViagem)) {
            throw new common_1.BadRequestException('idPacoteViagem invalido');
        }
        if (!idUserAutor || Number.isNaN(idUserAutor)) {
            throw new common_1.BadRequestException('idUserAutor invalido');
        }
        const pacote = await this.prisma.pacoteViagem.findUnique({ where: { id: idPacoteViagem } });
        if (!pacote) {
            throw new common_1.NotFoundException('pacote nao encontrado');
        }
        if (!this.canEvaluatePackage(pacote)) {
            throw new common_1.ForbiddenException('pacote ainda nao elegivel para avaliacao');
        }
        const autorEhOrganizador = pacote.idOrganizador === idUserAutor;
        const autorEhViajante = await this.prisma.viajante.findUnique({
            where: {
                idPacoteViagem_idUser: {
                    idPacoteViagem,
                    idUser: idUserAutor,
                },
            },
        });
        if (!autorEhOrganizador && (!autorEhViajante || autorEhViajante.statusParticipacao !== 'ATIVO')) {
            throw new common_1.ForbiddenException('autor nao participa do pacote');
        }
        const viajantes = await this.prisma.viajante.findMany({
            where: {
                idPacoteViagem,
                statusParticipacao: 'ATIVO',
            },
            select: { idUser: true },
        });
        const avaliadosExistentes = await this.prisma.avaliacao.findMany({
            where: {
                idPacoteViagem,
                idUserAutor,
            },
            select: {
                tipo: true,
                idUserAvaliado: true,
            },
        });
        const jaAvaliouPacote = avaliadosExistentes.some((a) => a.tipo === 'PACOTE');
        const jaAvaliouSet = new Set(avaliadosExistentes
            .filter((a) => a.tipo !== 'PACOTE')
            .map((a) => `${a.tipo}:${a.idUserAvaliado}`));
        const pendentes = [];
        if (autorEhOrganizador) {
            for (const v of viajantes) {
                if (v.idUser === idUserAutor) {
                    continue;
                }
                const key = `VIAJANTE:${v.idUser}`;
                if (!jaAvaliouSet.has(key)) {
                    pendentes.push({ tipo: 'VIAJANTE', idUserAvaliado: v.idUser });
                }
            }
        }
        else {
            const organizadorKey = `ORGANIZADOR:${pacote.idOrganizador}`;
            if (!jaAvaliouSet.has(organizadorKey)) {
                pendentes.push({ tipo: 'ORGANIZADOR', idUserAvaliado: pacote.idOrganizador });
            }
            for (const v of viajantes) {
                if (v.idUser === idUserAutor) {
                    continue;
                }
                const key = `VIAJANTE:${v.idUser}`;
                if (!jaAvaliouSet.has(key) && v.idUser !== pacote.idOrganizador) {
                    pendentes.push({ tipo: 'VIAJANTE', idUserAvaliado: v.idUser });
                }
            }
        }
        return {
            pacote: { pendente: !jaAvaliouPacote },
            avaliacoesPendentes: pendentes,
        };
    }
};
exports.AvaliacoesService = AvaliacoesService;
exports.AvaliacoesService = AvaliacoesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AvaliacoesService);
