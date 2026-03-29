"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeCityFilter = normalizeCityFilter;
exports.buildPacoteSearchContext = buildPacoteSearchContext;
exports.buildSearchResponse = buildSearchResponse;
const common_1 = require("@nestjs/common");
function normalizeCityFilter(value) {
    if (!value) {
        return value;
    }
    return value.split(' - ')[0]?.trim() ?? value;
}
function buildPacoteSearchContext(today, dto) {
    const dataInicio = dto.dataInicio;
    const dataFim = dto.dataFim;
    if (dataInicio && dataFim && dataInicio > dataFim) {
        throw new common_1.BadRequestException('dataInicio nao pode ser maior que dataFim');
    }
    const cidadePartida = normalizeCityFilter(dto.cidadePartida);
    const cidadeDestino = normalizeCityFilter(dto.cidadeDestino);
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? 12;
    const baseWhere = {
        status: 'ATIVO',
        privacidade: { not: 'PRIVADO' },
        dataInicio: { not: null, gte: today },
    };
    if (dto.tipo) {
        baseWhere.tipoPacoteViagem = dto.tipo;
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
    return {
        dataInicio,
        dataFim,
        page,
        pageSize,
        baseWhere,
        pagination: {
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { dataCriacao: 'desc' },
        },
    };
}
function buildSearchResponse(mode, page, pageSize, total, pacotes, mensagem) {
    return {
        modo: mode,
        ...(mensagem ? { mensagem } : {}),
        pacotes,
        pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
    };
}
