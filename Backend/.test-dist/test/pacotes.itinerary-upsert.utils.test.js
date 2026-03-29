"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const assert = require("node:assert/strict");
const pacotes_itinerary_upsert_utils_1 = require("../src/pacotes/pacotes.itinerary-upsert.utils");
(0, node_test_1.test)('collectSentEntityIds returns only numeric ids', () => {
    assert.deepEqual((0, pacotes_itinerary_upsert_utils_1.collectSentEntityIds)([{ id: 1 }, {}, { id: 3 }]), [1, 3]);
    assert.deepEqual((0, pacotes_itinerary_upsert_utils_1.collectSentEntityIds)(undefined), []);
});
(0, node_test_1.test)('normalizeRoteiroMetadata trims values and applies defaults', () => {
    assert.deepEqual((0, pacotes_itinerary_upsert_utils_1.normalizeRoteiroMetadata)({ titulo: '  Meu roteiro  ', descricao: '  teste  ' }), {
        titulo: 'Meu roteiro',
        descricao: 'teste',
    });
    assert.deepEqual((0, pacotes_itinerary_upsert_utils_1.normalizeRoteiroMetadata)({ titulo: '   ', descricao: '   ' }), {
        titulo: 'Roteiro da viagem',
        descricao: null,
    });
});
(0, node_test_1.test)('buildCaronaUpsertData normalizes carona payload', () => {
    const result = (0, pacotes_itinerary_upsert_utils_1.buildCaronaUpsertData)({
        origem: 'Salvador - BA',
        destino: 'Lençois - BA',
        dataIda: '2026-05-01T08:00:00.000Z',
        dataVolta: '2026-05-05T18:00:00.000Z',
        precoPorPessoa: 120,
        regrasCarona: '  Sem atrasos  ',
        status: '  CONFIRMADA  ',
    }, 10, 42, 100, 101);
    assert.deepEqual(result, {
        idPacoteViagem: 10,
        idMotorista: 42,
        dataIda: new Date('2026-05-01T08:00:00.000Z'),
        dataVolta: new Date('2026-05-05T18:00:00.000Z'),
        precoPorPessoa: 120,
        idEnderecoPartida: 100,
        idEnderecoDestino: 101,
        regrasCarona: 'Sem atrasos',
        status: 'CONFIRMADA',
    });
});
(0, node_test_1.test)('buildCaronaUpsertData applies fallback text and status', () => {
    const result = (0, pacotes_itinerary_upsert_utils_1.buildCaronaUpsertData)({}, 10, 42, null, null);
    assert.equal(result.regrasCarona, 'Horarios e regras a combinar.');
    assert.equal(result.status, 'PLANEJADA');
    assert.equal(result.dataIda, null);
});
(0, node_test_1.test)('buildHospedagemUpsertData normalizes hospedagem payload', () => {
    const result = (0, pacotes_itinerary_upsert_utils_1.buildHospedagemUpsertData)({
        nomeLocal: '  Pousada Azul  ',
        dataCheckin: '2026-05-01T14:00:00.000Z',
        dataCheckout: '2026-05-05T10:00:00.000Z',
        precoPorPessoa: 300,
        regrasHospedagem: '  Levar documento  ',
        statusReserva: '  CONFIRMADA  ',
    }, 10, 200);
    assert.deepEqual(result, {
        idPacoteViagem: 10,
        idEndereco: 200,
        nomeLocal: 'Pousada Azul',
        dataCheckin: new Date('2026-05-01T14:00:00.000Z'),
        dataCheckout: new Date('2026-05-05T10:00:00.000Z'),
        precoPorPessoa: 300,
        regrasHospedagem: 'Levar documento',
        statusReserva: 'CONFIRMADA',
    });
});
(0, node_test_1.test)('buildAtividadeUpsertData trims title and falls back descricao to title', () => {
    const result = (0, pacotes_itinerary_upsert_utils_1.buildAtividadeUpsertData)({
        categoria: 'ALIMENTACAO',
        titulo: '  Jantar  ',
        descricao: '   ',
        dataHoraInicio: '2026-05-02T19:00:00.000Z',
        dataHoraFim: '2026-05-02T21:00:00.000Z',
        preco: 80,
    }, 15, 3, null, 2);
    assert.deepEqual(result, {
        idRoteiro: 15,
        idCategoriaAtividade: 3,
        idEndereco: null,
        titulo: 'Jantar',
        descricao: 'Jantar',
        dataHoraInicio: new Date('2026-05-02T19:00:00.000Z'),
        dataHoraFim: new Date('2026-05-02T21:00:00.000Z'),
        ordem: 2,
        preco: 80,
    });
});
