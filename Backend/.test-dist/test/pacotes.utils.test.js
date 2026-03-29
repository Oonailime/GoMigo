"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const assert = require("node:assert/strict");
const pacotes_utils_1 = require("../src/pacotes/pacotes.utils");
(0, node_test_1.test)('createAddressData returns null for empty values', () => {
    assert.equal((0, pacotes_utils_1.createAddressData)(''), null);
    assert.equal((0, pacotes_utils_1.createAddressData)('   '), null);
    assert.equal((0, pacotes_utils_1.createAddressData)(undefined), null);
});
(0, node_test_1.test)('createAddressData parses city and state from the display label', () => {
    assert.deepEqual((0, pacotes_utils_1.createAddressData)('Salvador - BA'), {
        rua: 'Nao informado',
        cep: '00000000',
        cidade: 'Salvador',
        estado: 'BA',
    });
});
(0, node_test_1.test)('createAddressData falls back to default state when it is omitted', () => {
    assert.deepEqual((0, pacotes_utils_1.createAddressData)('Lençois'), {
        rua: 'Nao informado',
        cep: '00000000',
        cidade: 'Lençois',
        estado: 'Nao informado',
    });
});
(0, node_test_1.test)('formatCityLabel hides placeholder state values', () => {
    assert.equal((0, pacotes_utils_1.formatCityLabel)({ cidade: 'Lençois', estado: 'Nao informado' }), 'Lençois');
    assert.equal((0, pacotes_utils_1.formatCityLabel)({ cidade: 'Lençois', estado: null }), 'Lençois');
    assert.equal((0, pacotes_utils_1.formatCityLabel)({ cidade: 'Lençois', estado: 'BA' }), 'Lençois - BA');
});
(0, node_test_1.test)('formatCityLabel uses a friendly fallback when city is missing', () => {
    assert.equal((0, pacotes_utils_1.formatCityLabel)(undefined), 'Local a definir');
    assert.equal((0, pacotes_utils_1.formatCityLabel)({ cidade: null, estado: 'BA' }), 'Local a definir');
});
