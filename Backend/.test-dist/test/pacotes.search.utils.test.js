"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const assert = require("node:assert/strict");
const common_1 = require("@nestjs/common");
const pacotes_search_utils_1 = require("../src/pacotes/pacotes.search.utils");
(0, node_test_1.test)('normalizeCityFilter strips the state suffix from city labels', () => {
    assert.equal((0, pacotes_search_utils_1.normalizeCityFilter)('Salvador - BA'), 'Salvador');
    assert.equal((0, pacotes_search_utils_1.normalizeCityFilter)('Rio de Janeiro'), 'Rio de Janeiro');
    assert.equal((0, pacotes_search_utils_1.normalizeCityFilter)(undefined), undefined);
});
(0, node_test_1.test)('buildPacoteSearchContext applies defaults and normalized city filters', () => {
    const today = new Date('2026-03-29T00:00:00.000Z');
    const result = (0, pacotes_search_utils_1.buildPacoteSearchContext)(today, {
        cidadePartida: 'Salvador - BA',
        cidadeDestino: 'Lençois - BA',
    });
    assert.equal(result.page, 1);
    assert.equal(result.pageSize, 12);
    assert.deepEqual(result.pagination, {
        skip: 0,
        take: 12,
        orderBy: { dataCriacao: 'desc' },
    });
    assert.deepEqual(result.baseWhere.enderecoPartida, {
        cidade: { contains: 'Salvador', mode: 'insensitive' },
    });
    assert.deepEqual(result.baseWhere.enderecoDestino, {
        cidade: { contains: 'Lençois', mode: 'insensitive' },
    });
});
(0, node_test_1.test)('buildPacoteSearchContext rejects inverted date ranges', () => {
    const today = new Date('2026-03-29T00:00:00.000Z');
    assert.throws(() => (0, pacotes_search_utils_1.buildPacoteSearchContext)(today, {
        dataInicio: new Date('2026-06-10T00:00:00.000Z'),
        dataFim: new Date('2026-06-01T00:00:00.000Z'),
    }), (error) => error instanceof common_1.BadRequestException &&
        error.message === 'dataInicio nao pode ser maior que dataFim');
});
(0, node_test_1.test)('buildPacoteSearchContext preserves the package type filter', () => {
    const today = new Date('2026-03-29T00:00:00.000Z');
    const result = (0, pacotes_search_utils_1.buildPacoteSearchContext)(today, {
        tipo: 'BATE_VOLTA',
        page: 2,
        pageSize: 5,
    });
    assert.equal(result.page, 2);
    assert.equal(result.pageSize, 5);
    assert.equal(result.baseWhere.tipoPacoteViagem, 'BATE_VOLTA');
});
(0, node_test_1.test)('buildSearchResponse returns stable pagination metadata', () => {
    const result = (0, pacotes_search_utils_1.buildSearchResponse)('INTERSECCAO', 2, 5, 11, [{ id: 1 }], 'Datas proximas');
    assert.deepEqual(result, {
        modo: 'INTERSECCAO',
        mensagem: 'Datas proximas',
        pacotes: [{ id: 1 }],
        pagination: {
            page: 2,
            pageSize: 5,
            total: 11,
            totalPages: 3,
        },
    });
});
(0, node_test_1.test)('buildSearchResponse keeps at least one page even with zero results', () => {
    const result = (0, pacotes_search_utils_1.buildSearchResponse)('SEM_RESULTADOS', 1, 12, 0, []);
    assert.equal(result.pagination.totalPages, 1);
});
