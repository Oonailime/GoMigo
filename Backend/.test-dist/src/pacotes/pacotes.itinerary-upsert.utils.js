"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectSentEntityIds = collectSentEntityIds;
exports.normalizeRoteiroMetadata = normalizeRoteiroMetadata;
exports.buildCaronaUpsertData = buildCaronaUpsertData;
exports.buildHospedagemUpsertData = buildHospedagemUpsertData;
exports.buildAtividadeUpsertData = buildAtividadeUpsertData;
function collectSentEntityIds(items) {
    return (items ?? []).flatMap((item) => (typeof item.id === 'number' ? [item.id] : []));
}
function normalizeRoteiroMetadata(data) {
    return {
        titulo: data.titulo?.trim() || 'Roteiro da viagem',
        descricao: data.descricao?.trim() || null,
    };
}
function buildCaronaUpsertData(item, idPacoteViagem, idMotorista, idEnderecoPartida, idEnderecoDestino) {
    return {
        idPacoteViagem,
        idMotorista,
        dataIda: item.dataIda ? new Date(item.dataIda) : null,
        dataVolta: item.dataVolta ? new Date(item.dataVolta) : null,
        precoPorPessoa: item.precoPorPessoa ?? null,
        idEnderecoPartida,
        idEnderecoDestino,
        regrasCarona: item.regrasCarona?.trim() || 'Horarios e regras a combinar.',
        status: item.status?.trim() || 'PLANEJADA',
    };
}
function buildHospedagemUpsertData(item, idPacoteViagem, idEndereco) {
    return {
        idPacoteViagem,
        idEndereco,
        nomeLocal: item.nomeLocal?.trim() || 'Hospedagem',
        dataCheckin: item.dataCheckin ? new Date(item.dataCheckin) : null,
        dataCheckout: item.dataCheckout ? new Date(item.dataCheckout) : null,
        precoPorPessoa: item.precoPorPessoa ?? null,
        regrasHospedagem: item.regrasHospedagem?.trim() || 'Regras da hospedagem a combinar.',
        statusReserva: item.statusReserva?.trim() || 'PLANEJADA',
    };
}
function buildAtividadeUpsertData(item, idRoteiro, idCategoriaAtividade, idEndereco, ordem) {
    const titulo = item.titulo.trim();
    return {
        idRoteiro,
        idCategoriaAtividade,
        idEndereco,
        titulo,
        descricao: item.descricao?.trim() || titulo,
        dataHoraInicio: new Date(item.dataHoraInicio),
        dataHoraFim: new Date(item.dataHoraFim),
        ordem,
        preco: item.preco ?? null,
    };
}
