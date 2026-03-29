"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const assert = require("node:assert/strict");
const common_1 = require("@nestjs/common");
const solicitacoes_service_1 = require("../src/solicitacoes/solicitacoes.service");
function createPrismaMock() {
    return {
        $transaction: async (fn) => fn({
            solicitacaoParticipacao: {
                findUnique: async () => null,
                update: async (args) => args,
            },
            pacoteViagem: {
                findUnique: async () => null,
            },
            viajante: {
                count: async () => 0,
                create: async (args) => args,
            },
        }),
        pacoteViagem: {
            findUnique: async () => null,
        },
        solicitacaoParticipacao: {
            create: async (args) => args,
            findUnique: async () => null,
            findMany: async () => [],
            update: async (args) => args,
        },
        viajante: {
            findUnique: async () => null,
            count: async () => 0,
            create: async (args) => args,
        },
        avaliacao: {
            findMany: async () => [],
        },
    };
}
(0, node_test_1.test)('SolicitacoesService.findByPacote rejects users who are not the organizer', async () => {
    const prisma = createPrismaMock();
    prisma.pacoteViagem.findUnique = async () => ({ id: 9, idOrganizador: 77 });
    const service = new solicitacoes_service_1.SolicitacoesService(prisma);
    await assert.rejects(service.findByPacote(9, 12), (error) => error instanceof common_1.ForbiddenException &&
        error.message === 'apenas o organizador pode visualizar as solicitacoes');
});
(0, node_test_1.test)('SolicitacoesService.findOneForUser rejects unrelated users', async () => {
    const prisma = createPrismaMock();
    prisma.solicitacaoParticipacao.findUnique = async () => ({
        id: 15,
        idUser: 30,
        pacoteViagem: {
            id: 9,
            titulo: 'Pacote teste',
            idOrganizador: 77,
        },
    });
    const service = new solicitacoes_service_1.SolicitacoesService(prisma);
    await assert.rejects(service.findOneForUser(15, 12), (error) => error instanceof common_1.ForbiddenException &&
        error.message === 'usuario nao pode visualizar esta solicitacao');
});
(0, node_test_1.test)('SolicitacoesService.aceitarSolicitacao validates organizer id before running the transaction', async () => {
    const prisma = createPrismaMock();
    const service = new solicitacoes_service_1.SolicitacoesService(prisma);
    await assert.rejects(service.aceitarSolicitacao(8, Number.NaN), (error) => error instanceof common_1.BadRequestException &&
        error.message === 'idUserOrganizador invalido');
});
(0, node_test_1.test)('SolicitacoesService.solicitarParticipacao rejects invalid user ids', async () => {
    const prisma = createPrismaMock();
    const service = new solicitacoes_service_1.SolicitacoesService(prisma);
    await assert.rejects(service.solicitarParticipacao(8, 0, {}), (error) => error instanceof common_1.BadRequestException &&
        error.message === 'idUser invalido');
});
