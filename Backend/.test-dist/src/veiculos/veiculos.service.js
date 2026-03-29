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
exports.VeiculosService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let VeiculosService = class VeiculosService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.veiculo.create({ data });
    }
    async createForOwner(idUserProprietario, data) {
        return this.prisma.veiculo.create({
            data: {
                ...data,
                idUserProprietario,
            },
        });
    }
    async findAll() {
        return this.prisma.veiculo.findMany();
    }
    async findByOwner(idUserProprietario) {
        return this.prisma.veiculo.findMany({
            where: { idUserProprietario },
            orderBy: { id: 'desc' },
        });
    }
    async findOne(id) {
        if (!id || Number.isNaN(id)) {
            throw new common_1.BadRequestException('id invalido');
        }
        const veiculo = await this.prisma.veiculo.findUnique({ where: { id } });
        if (!veiculo) {
            throw new common_1.NotFoundException('veiculo nao encontrado');
        }
        return veiculo;
    }
    async findOneForOwner(id, idUserProprietario) {
        const veiculo = await this.findOne(id);
        if (veiculo.idUserProprietario !== idUserProprietario) {
            throw new common_1.ForbiddenException('usuario nao pode acessar este veiculo');
        }
        return veiculo;
    }
    async update(id, data) {
        if (!id || Number.isNaN(id)) {
            throw new common_1.BadRequestException('id invalido');
        }
        try {
            return await this.prisma.veiculo.update({ where: { id }, data });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new common_1.NotFoundException('veiculo nao encontrado');
            }
            throw error;
        }
    }
    async updateForOwner(id, idUserProprietario, data) {
        await this.findOneForOwner(id, idUserProprietario);
        return this.update(id, data);
    }
    async delete(id) {
        if (!id || Number.isNaN(id)) {
            throw new common_1.BadRequestException('id invalido');
        }
        try {
            return await this.prisma.veiculo.delete({ where: { id } });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new common_1.NotFoundException('veiculo nao encontrado');
            }
            throw error;
        }
    }
    async deleteForOwner(id, idUserProprietario) {
        await this.findOneForOwner(id, idUserProprietario);
        return this.delete(id);
    }
};
exports.VeiculosService = VeiculosService;
exports.VeiculosService = VeiculosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VeiculosService);
