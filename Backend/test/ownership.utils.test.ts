import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  assertOwnership,
  assertValidNumericId,
  findOwnedPackageOrThrow,
} from '../src/auth/ownership.utils';

test('assertValidNumericId returns the numeric id when valid', () => {
  assert.equal(assertValidNumericId(12, 'idOrganizador'), 12);
});

test('assertValidNumericId rejects empty ids', () => {
  assert.throws(
    () => assertValidNumericId(0, 'idOrganizador'),
    (error: unknown) =>
      error instanceof BadRequestException &&
      error.message === 'idOrganizador invalido',
  );
});

test('assertOwnership allows access for the same owner', () => {
  assert.doesNotThrow(() =>
    assertOwnership(7, 7, () => new ForbiddenException('sem permissao')),
  );
});

test('assertOwnership rejects access for a different owner', () => {
  assert.throws(
    () => assertOwnership(7, 9, () => new ForbiddenException('sem permissao')),
    (error: unknown) =>
      error instanceof ForbiddenException && error.message === 'sem permissao',
  );
});

test('findOwnedPackageOrThrow returns the package when the organizer owns it', async () => {
  const prisma = {
    pacoteViagem: {
      findUnique: async () => ({ id: 15, idOrganizador: 4 }),
    },
  };

  const result = await findOwnedPackageOrThrow(
    prisma,
    15,
    4,
    () => new NotFoundException('pacote nao encontrado para este organizador'),
  );

  assert.deepEqual(result, { id: 15, idOrganizador: 4 });
});

test('findOwnedPackageOrThrow hides packages from another organizer', async () => {
  const prisma = {
    pacoteViagem: {
      findUnique: async () => ({ id: 15, idOrganizador: 99 }),
    },
  };

  await assert.rejects(
    findOwnedPackageOrThrow(
      prisma,
      15,
      4,
      () => new NotFoundException('pacote nao encontrado para este organizador'),
    ),
    (error: unknown) =>
      error instanceof NotFoundException &&
      error.message === 'pacote nao encontrado para este organizador',
  );
});

test('findOwnedPackageOrThrow rejects invalid organizer ids before querying ownership', async () => {
  const prisma = {
    pacoteViagem: {
      findUnique: async () => ({ id: 15, idOrganizador: 4 }),
    },
  };

  await assert.rejects(
    findOwnedPackageOrThrow(
      prisma,
      15,
      Number.NaN,
      () => new NotFoundException('pacote nao encontrado para este organizador'),
    ),
    (error: unknown) =>
      error instanceof BadRequestException &&
      error.message === 'idOrganizador invalido',
  );
});
