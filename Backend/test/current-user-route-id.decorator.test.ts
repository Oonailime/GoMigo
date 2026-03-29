import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { readCurrentUserRouteId } from '../src/auth/current-user-route-id.decorator';

test('readCurrentUserRouteId returns the route id when it matches the authenticated user', () => {
  assert.equal(
    readCurrentUserRouteId({
      user: { sub: 42 },
      params: { id: '42' },
    }),
    42,
  );
});

test('readCurrentUserRouteId supports custom param names', () => {
  assert.equal(
    readCurrentUserRouteId(
      {
        user: { sub: 7 },
        params: { userId: '7' },
      },
      'userId',
    ),
    7,
  );
});

test('readCurrentUserRouteId rejects unauthenticated requests', () => {
  assert.throws(
    () => readCurrentUserRouteId({ params: { id: '5' } }),
    (error: unknown) =>
      error instanceof UnauthorizedException &&
      error.message === 'usuario sem perfil completo',
  );
});

test('readCurrentUserRouteId rejects invalid route ids', () => {
  assert.throws(
    () =>
      readCurrentUserRouteId({
        user: { sub: 5 },
        params: { id: 'abc' },
      }),
    (error: unknown) =>
      error instanceof ForbiddenException &&
      error.message === 'parametro id invalido para a rota autenticada',
  );
});

test('readCurrentUserRouteId rejects access to another user route', () => {
  assert.throws(
    () =>
      readCurrentUserRouteId({
        user: { sub: 5 },
        params: { id: '9' },
      }),
    (error: unknown) =>
      error instanceof ForbiddenException &&
      error.message === 'usuario nao pode acessar outro perfil por esta rota',
  );
});
