"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const assert = require("node:assert/strict");
const common_1 = require("@nestjs/common");
const anuncios_service_1 = require("../src/anuncios/anuncios.service");
function createPrismaMock() {
    return {
        pacoteViagem: {
            findUnique: async () => null,
        },
        anuncioPacote: {
            create: async (_args) => null,
            findMany: async () => [],
            findUnique: async () => null,
            update: async (_args) => null,
            delete: async (_args) => null,
        },
    };
}
(0, node_test_1.test)('AnunciosService.create binds the authenticated organizer to the new anuncio', async () => {
    const prisma = createPrismaMock();
    prisma.pacoteViagem.findUnique = async () => ({ id: 10, idOrganizador: 42 });
    prisma.anuncioPacote.create = async (args) => args;
    const service = new anuncios_service_1.AnunciosService(prisma);
    const payload = {
        idPacoteViagem: 10,
        tituloAnuncio: 'Pacote para feriado',
        descricaoAnuncio: 'Saida cedo',
        statusAnuncio: 'ATIVO',
        orcamento: 1500,
    };
    const result = await service.create(42, payload);
    assert.deepEqual(result, {
        data: {
            ...payload,
            idOrganizador: 42,
        },
    });
});
(0, node_test_1.test)('AnunciosService.create hides packages from another organizer', async () => {
    const prisma = createPrismaMock();
    prisma.pacoteViagem.findUnique = async () => ({ id: 10, idOrganizador: 99 });
    const service = new anuncios_service_1.AnunciosService(prisma);
    await assert.rejects(service.create(42, {
        idPacoteViagem: 10,
        tituloAnuncio: 'Pacote para feriado',
        statusAnuncio: 'ATIVO',
    }), (error) => error instanceof common_1.NotFoundException &&
        error.message === 'pacote nao encontrado para este organizador');
});
(0, node_test_1.test)('AnunciosService.update rejects edits from another organizer', async () => {
    const prisma = createPrismaMock();
    prisma.anuncioPacote.findUnique = async () => ({ id: 8, idOrganizador: 77 });
    const service = new anuncios_service_1.AnunciosService(prisma);
    await assert.rejects(service.update(42, 8, { tituloAnuncio: 'Novo titulo' }), (error) => error instanceof common_1.ForbiddenException &&
        error.message === 'somente o organizador do anuncio pode altera-lo');
});
(0, node_test_1.test)('AnunciosService.delete rejects missing anuncios before delete', async () => {
    const prisma = createPrismaMock();
    prisma.anuncioPacote.findUnique = async () => null;
    const service = new anuncios_service_1.AnunciosService(prisma);
    await assert.rejects(service.delete(42, 8), (error) => error instanceof common_1.NotFoundException &&
        error.message === 'anuncio nao encontrado');
});
