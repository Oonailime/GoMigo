import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { SolicitacoesService } from '../src/solicitacoes/solicitacoes.service';

function createPrismaMock() {
  return {
    $transaction: async <T>(
      fn: (tx: {
        solicitacaoParticipacao: {
          findUnique(args: unknown): Promise<unknown>;
          update(args: unknown): Promise<unknown>;
        };
        pacoteViagem: {
          findUnique(args: unknown): Promise<unknown>;
        };
        viajante: {
          count(args: unknown): Promise<number>;
          create(args: unknown): Promise<unknown>;
        };
      }) => Promise<T>,
    ) =>
      fn({
        solicitacaoParticipacao: {
          findUnique: async () => null,
          update: async (args: unknown) => args,
        },
        pacoteViagem: {
          findUnique: async () => null,
        },
        viajante: {
          count: async () => 0,
          create: async (args: unknown) => args,
        },
      }),
    pacoteViagem: {
      findUnique: async () => null as unknown,
    },
    solicitacaoParticipacao: {
      create: async (args: unknown) => args,
      findUnique: async () => null as unknown,
      findMany: async () => [] as unknown[],
      update: async (args: unknown) => args,
    },
    viajante: {
      findUnique: async () => null as unknown,
      count: async () => 0,
      create: async (args: unknown) => args,
    },
    avaliacao: {
      findMany: async () => [] as unknown[],
    },
  };
}

test('SolicitacoesService.findByPacote rejects users who are not the organizer', async () => {
  const prisma = createPrismaMock();
  prisma.pacoteViagem.findUnique = async () => ({ id: 9, idOrganizador: 77 });

  const service = new SolicitacoesService(prisma as never);

  await assert.rejects(
    service.findByPacote(9, 12),
    (error: unknown) =>
      error instanceof ForbiddenException &&
      error.message === 'apenas o organizador pode visualizar as solicitacoes',
  );
});

test('SolicitacoesService.findOneForUser rejects unrelated users', async () => {
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

  const service = new SolicitacoesService(prisma as never);

  await assert.rejects(
    service.findOneForUser(15, 12),
    (error: unknown) =>
      error instanceof ForbiddenException &&
      error.message === 'usuario nao pode visualizar esta solicitacao',
  );
});

test('SolicitacoesService.aceitarSolicitacao validates organizer id before running the transaction', async () => {
  const prisma = createPrismaMock();
  const service = new SolicitacoesService(prisma as never);

  await assert.rejects(
    service.aceitarSolicitacao(8, Number.NaN),
    (error: unknown) =>
      error instanceof BadRequestException &&
      error.message === 'idUserOrganizador invalido',
  );
});

test('SolicitacoesService.solicitarParticipacao rejects invalid user ids', async () => {
  const prisma = createPrismaMock();
  const service = new SolicitacoesService(prisma as never);

  await assert.rejects(
    service.solicitarParticipacao(8, 0, {}),
    (error: unknown) =>
      error instanceof BadRequestException &&
      error.message === 'idUser invalido',
  );
});
