import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  filterTravelerTrips,
  resolvePackageViewerRole,
} from '../src/pacotes/pacotes.access.utils';

test('resolvePackageViewerRole returns ORGANIZADOR for the organizer', () => {
  assert.equal(
    resolvePackageViewerRole(
      {
        id: 10,
        idOrganizador: 42,
        viajantes: [{ idUser: 7 }],
      },
      42,
    ),
    'ORGANIZADOR',
  );
});

test('resolvePackageViewerRole returns VIAJANTE for active travelers', () => {
  assert.equal(
    resolvePackageViewerRole(
      {
        id: 10,
        idOrganizador: 42,
        viajantes: [{ idUser: 7 }],
      },
      7,
    ),
    'VIAJANTE',
  );
});

test('resolvePackageViewerRole returns null for unrelated users', () => {
  assert.equal(
    resolvePackageViewerRole(
      {
        id: 10,
        idOrganizador: 42,
        viajantes: [{ idUser: 7 }],
      },
      99,
    ),
    null,
  );
});

test('filterTravelerTrips removes duplicates already present in organizer trips', () => {
  assert.deepEqual(
    filterTravelerTrips(
      [{ id: 1 }, { id: 2 }],
      [{ id: 2 }, { id: 3 }, { id: 4 }],
    ),
    [{ id: 3 }, { id: 4 }],
  );
});
