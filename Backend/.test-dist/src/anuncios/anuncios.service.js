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
exports.AnunciosService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const ownership_utils_1 = require("../auth/ownership.utils");
const prisma_service_1 = require("../prisma/prisma.service");
let AnunciosService = class AnunciosService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(idOrganizador, data) {
        await (0, ownership_utils_1.findOwnedPackageOrThrow)(this.prisma, data.idPacoteViagem, idOrganizador, () => new common_1.NotFoundException('pacote nao encontrado para este organizador'));
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
    async findOne(id) {
        if (!id || Number.isNaN(id)) {
            throw new common_1.BadRequestException('id invalido');
        }
        const anuncio = await this.prisma.anuncioPacote.findUnique({ where: { id } });
        if (!anuncio) {
            throw new common_1.NotFoundException('anuncio nao encontrado');
        }
        return anuncio;
    }
    async update(idOrganizador, id, data) {
        if (!id || Number.isNaN(id)) {
            throw new common_1.BadRequestException('id invalido');
        }
        const anuncio = await this.prisma.anuncioPacote.findUnique({
            where: { id },
            select: { id: true, idOrganizador: true },
        });
        if (!anuncio) {
            throw new common_1.NotFoundException('anuncio nao encontrado');
        }
        (0, ownership_utils_1.assertOwnership)(anuncio.idOrganizador, idOrganizador, () => new common_1.ForbiddenException('somente o organizador do anuncio pode altera-lo'));
        try {
            return await this.prisma.anuncioPacote.update({ where: { id }, data });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new common_1.NotFoundException('anuncio nao encontrado');
            }
            throw error;
        }
    }
    async delete(idOrganizador, id) {
        if (!id || Number.isNaN(id)) {
            throw new common_1.BadRequestException('id invalido');
        }
        const anuncio = await this.prisma.anuncioPacote.findUnique({
            where: { id },
            select: { id: true, idOrganizador: true },
        });
        if (!anuncio) {
            throw new common_1.NotFoundException('anuncio nao encontrado');
        }
        (0, ownership_utils_1.assertOwnership)(anuncio.idOrganizador, idOrganizador, () => new common_1.ForbiddenException('somente o organizador do anuncio pode exclui-lo'));
        try {
            return await this.prisma.anuncioPacote.delete({ where: { id } });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new common_1.NotFoundException('anuncio nao encontrado');
            }
            throw error;
        }
    }
};
exports.AnunciosService = AnunciosService;
exports.AnunciosService = AnunciosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnunciosService);
