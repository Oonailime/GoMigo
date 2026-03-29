"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapRoteiroHeader = mapRoteiroHeader;
exports.mapCaronasForItinerary = mapCaronasForItinerary;
exports.mapHospedagensForItinerary = mapHospedagensForItinerary;
exports.mapAtividadesForItinerary = mapAtividadesForItinerary;
exports.buildItineraryTimeline = buildItineraryTimeline;
const pacotes_utils_1 = require("./pacotes.utils");
function mapAtividadeCategoria(nome) {
    return nome === 'Alimentacao' ? 'ALIMENTACAO' : 'PASSEIO_TURISMO';
}
function mapRoteiroHeader(roteiro) {
    return {
        id: roteiro?.id ?? null,
        titulo: roteiro?.titulo ?? 'Roteiro da viagem',
        descricao: roteiro?.descricao ?? null,
    };
}
function mapCaronasForItinerary(caronas) {
    return caronas.map((item) => ({
        id: item.id,
        origem: item.enderecoPartida ? (0, pacotes_utils_1.formatCityLabel)(item.enderecoPartida) : null,
        destino: item.enderecoDestino ? (0, pacotes_utils_1.formatCityLabel)(item.enderecoDestino) : null,
        dataIda: item.dataIda?.toISOString() ?? null,
        dataVolta: item.dataVolta?.toISOString() ?? null,
        precoPorPessoa: item.precoPorPessoa ?? null,
        regrasCarona: item.regrasCarona,
        status: item.status,
    }));
}
function mapHospedagensForItinerary(hospedagens) {
    return hospedagens.map((item) => ({
        id: item.id,
        nomeLocal: item.nomeLocal ?? null,
        local: item.endereco ? (0, pacotes_utils_1.formatCityLabel)(item.endereco) : null,
        dataCheckin: item.dataCheckin?.toISOString() ?? null,
        dataCheckout: item.dataCheckout?.toISOString() ?? null,
        precoPorPessoa: item.precoPorPessoa ?? null,
        regrasHospedagem: item.regrasHospedagem,
        statusReserva: item.statusReserva,
    }));
}
function mapAtividadesForItinerary(atividades) {
    return atividades.map((item) => ({
        id: item.id,
        categoria: mapAtividadeCategoria(item.categoriaAtividade?.nome),
        titulo: item.titulo,
        descricao: item.descricao ?? null,
        dataHoraInicio: item.dataHoraInicio.toISOString(),
        dataHoraFim: item.dataHoraFim.toISOString(),
        preco: item.preco ?? null,
        local: item.endereco ? (0, pacotes_utils_1.formatCityLabel)(item.endereco) : null,
    }));
}
function buildItineraryTimeline(caronas, hospedagens, atividades) {
    return [
        ...caronas.map((item) => ({
            kind: 'CARONA',
            id: item.id,
            title: `${(0, pacotes_utils_1.formatCityLabel)(item.enderecoPartida ?? undefined)} -> ${(0, pacotes_utils_1.formatCityLabel)(item.enderecoDestino ?? undefined)}`,
            startsAt: item.dataIda?.toISOString() ?? null,
            endsAt: item.dataVolta?.toISOString() ?? null,
            subtitle: item.regrasCarona,
        })),
        ...hospedagens.map((item) => ({
            kind: 'HOSPEDAGEM',
            id: item.id,
            title: item.nomeLocal ?? 'Hospedagem',
            startsAt: item.dataCheckin?.toISOString() ?? null,
            endsAt: item.dataCheckout?.toISOString() ?? null,
            subtitle: item.endereco ? (0, pacotes_utils_1.formatCityLabel)(item.endereco) : item.regrasHospedagem,
        })),
        ...atividades.map((item) => ({
            kind: mapAtividadeCategoria(item.categoriaAtividade?.nome),
            id: item.id,
            title: item.titulo,
            startsAt: item.dataHoraInicio.toISOString(),
            endsAt: item.dataHoraFim.toISOString(),
            subtitle: item.endereco ? (0, pacotes_utils_1.formatCityLabel)(item.endereco) : item.descricao ?? null,
        })),
    ].sort((a, b) => {
        const left = a.startsAt ? new Date(a.startsAt).getTime() : Number.MAX_SAFE_INTEGER;
        const right = b.startsAt ? new Date(b.startsAt).getTime() : Number.MAX_SAFE_INTEGER;
        return left - right;
    });
}
