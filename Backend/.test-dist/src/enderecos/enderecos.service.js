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
exports.EnderecosService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let EnderecosService = class EnderecosService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.endereco.create({ data });
    }
    async findAll() {
        return this.prisma.endereco.findMany();
    }
    async findOne(id) {
        if (!id || Number.isNaN(id)) {
            throw new common_1.BadRequestException('id invalido');
        }
        const endereco = await this.prisma.endereco.findUnique({ where: { id } });
        if (!endereco) {
            throw new common_1.NotFoundException('endereco nao encontrado');
        }
        return endereco;
    }
    async update(id, data) {
        if (!id || Number.isNaN(id)) {
            throw new common_1.BadRequestException('id invalido');
        }
        try {
            return await this.prisma.endereco.update({ where: { id }, data });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new common_1.NotFoundException('endereco nao encontrado');
            }
            throw error;
        }
    }
    async delete(id) {
        if (!id || Number.isNaN(id)) {
            throw new common_1.BadRequestException('id invalido');
        }
        try {
            return await this.prisma.endereco.delete({ where: { id } });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new common_1.NotFoundException('endereco nao encontrado');
            }
            throw error;
        }
    }
};
exports.EnderecosService = EnderecosService;
exports.EnderecosService = EnderecosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EnderecosService);
