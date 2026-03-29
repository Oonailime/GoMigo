"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAddressData = createAddressData;
exports.formatCityLabel = formatCityLabel;
function createAddressData(value) {
    if (!value?.trim()) {
        return null;
    }
    const [cidadePart, estadoPart] = value.split(' - ');
    return {
        rua: 'Nao informado',
        cep: '00000000',
        cidade: cidadePart?.trim() || value.trim(),
        estado: estadoPart?.trim() || 'Nao informado',
    };
}
function formatCityLabel(value) {
    if (!value?.cidade) {
        return 'Local a definir';
    }
    if (!value.estado || value.estado === 'Nao informado') {
        return value.cidade;
    }
    return `${value.cidade} - ${value.estado}`;
}
