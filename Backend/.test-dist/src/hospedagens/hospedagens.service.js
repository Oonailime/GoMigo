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
exports.HospedagensService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const ownership_utils_1 = require("../auth/ownership.utils");
const prisma_service_1 = require("../prisma/prisma.service");
let HospedagensService = class HospedagensService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.hospedagem.create({ data });
    }
    async ensureOrganizerOwnsPackage(idPacoteViagem, idOrganizador) {
        return (0, ownership_utils_1.findOwnedPackageOrThrow)(this.prisma, idPacoteViagem, idOrganizador, () => new common_1.NotFoundException('pacote nao encontrado para este organizador'));
    }
    async createForOrganizer(idOrganizador, data) {
        await this.ensureOrganizerOwnsPackage(data.idPacoteViagem, idOrganizador);
        return this.prisma.hospedagem.create({ data });
    }
    async findAll() {
        return this.prisma.hospedagem.findMany();
    }
    async findByOrganizer(idOrganizador) {
        return this.prisma.hospedagem.findMany({
            where: {
                pacoteViagem: {
                    idOrganizador,
                },
            },
            orderBy: { id: 'desc' },
        });
    }
    async findOne(id) {
        if (!id || Number.isNaN(id)) {
            throw new common_1.BadRequestException('id invalido');
        }
        const hospedagem = await this.prisma.hospedagem.findUnique({ where: { id } });
        if (!hospedagem) {
            throw new common_1.NotFoundException('hospedagem nao encontrada');
        }
        return hospedagem;
    }
    async findOneForOrganizer(id, idOrganizador) {
        const hospedagem = await this.prisma.hospedagem.findUnique({
            where: { id },
            include: {
                pacoteViagem: {
                    select: {
                        idOrganizador: true,
                    },
                },
            },
        });
        if (!hospedagem) {
            throw new common_1.NotFoundException('hospedagem nao encontrada');
        }
        (0, ownership_utils_1.assertOwnership)(hospedagem.pacoteViagem.idOrganizador, idOrganizador, () => new common_1.ForbiddenException('usuario nao pode acessar esta hospedagem'));
        return hospedagem;
    }
    async update(id, data) {
        if (!id || Number.isNaN(id)) {
            throw new common_1.BadRequestException('id invalido');
        }
        try {
            return await this.prisma.hospedagem.update({ where: { id }, data });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new common_1.NotFoundException('hospedagem nao encontrada');
            }
            throw error;
        }
    }
    async updateForOrganizer(id, idOrganizador, data) {
        await this.findOneForOrganizer(id, idOrganizador);
        return this.update(id, data);
    }
    async delete(id) {
        if (!id || Number.isNaN(id)) {
            throw new common_1.BadRequestException('id invalido');
        }
        try {
            return await this.prisma.hospedagem.delete({ where: { id } });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new common_1.NotFoundException('hospedagem nao encontrada');
            }
            throw error;
        }
    }
    async deleteForOrganizer(id, idOrganizador) {
        await this.findOneForOrganizer(id, idOrganizador);
        return this.delete(id);
    }
};
exports.HospedagensService = HospedagensService;
exports.HospedagensService = HospedagensService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HospedagensService);
