import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AnunciosService } from '../src/anuncios/anuncios.service';

function createPrismaMock() {
  return {
    pacoteViagem: {
      findUnique: async () => null as { id: number; idOrganizador: number } | null,
    },
    anuncioPacote: {
      create: async (_args: unknown) => null as unknown,
      findMany: async () => [],
      findUnique: async () => null as { id: number; idOrganizador: number } | null,
      update: async (_args: unknown) => null as unknown,
      delete: async (_args: unknown) => null as unknown,
    },
  };
}

test('AnunciosService.create binds the authenticated organizer to the new anuncio', async () => {
  const prisma = createPrismaMock();
  prisma.pacoteViagem.findUnique = async () => ({ id: 10, idOrganizador: 42 });
  prisma.anuncioPacote.create = async (args: unknown) => args;

  const service = new AnunciosService(prisma as never);
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

test('AnunciosService.create hides packages from another organizer', async () => {
  const prisma = createPrismaMock();
  prisma.pacoteViagem.findUnique = async () => ({ id: 10, idOrganizador: 99 });

  const service = new AnunciosService(prisma as never);

  await assert.rejects(
    service.create(42, {
      idPacoteViagem: 10,
      tituloAnuncio: 'Pacote para feriado',
      statusAnuncio: 'ATIVO',
    }),
    (error: unknown) =>
      error instanceof NotFoundException &&
      error.message === 'pacote nao encontrado para este organizador',
  );
});

test('AnunciosService.update rejects edits from another organizer', async () => {
  const prisma = createPrismaMock();
  prisma.anuncioPacote.findUnique = async () => ({ id: 8, idOrganizador: 77 });

  const service = new AnunciosService(prisma as never);

  await assert.rejects(
    service.update(42, 8, { tituloAnuncio: 'Novo titulo' }),
    (error: unknown) =>
      error instanceof ForbiddenException &&
      error.message === 'somente o organizador do anuncio pode altera-lo',
  );
});

test('AnunciosService.delete rejects missing anuncios before delete', async () => {
  const prisma = createPrismaMock();
  prisma.anuncioPacote.findUnique = async () => null;

  const service = new AnunciosService(prisma as never);

  await assert.rejects(
    service.delete(42, 8),
    (error: unknown) =>
      error instanceof NotFoundException &&
      error.message === 'anuncio nao encontrado',
  );
});
