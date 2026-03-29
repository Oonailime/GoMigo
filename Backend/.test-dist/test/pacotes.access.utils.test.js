"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const assert = require("node:assert/strict");
const pacotes_access_utils_1 = require("../src/pacotes/pacotes.access.utils");
(0, node_test_1.test)('resolvePackageViewerRole returns ORGANIZADOR for the organizer', () => {
    assert.equal((0, pacotes_access_utils_1.resolvePackageViewerRole)({
        id: 10,
        idOrganizador: 42,
        viajantes: [{ idUser: 7 }],
    }, 42), 'ORGANIZADOR');
});
(0, node_test_1.test)('resolvePackageViewerRole returns VIAJANTE for active travelers', () => {
    assert.equal((0, pacotes_access_utils_1.resolvePackageViewerRole)({
        id: 10,
        idOrganizador: 42,
        viajantes: [{ idUser: 7 }],
    }, 7), 'VIAJANTE');
});
(0, node_test_1.test)('resolvePackageViewerRole returns null for unrelated users', () => {
    assert.equal((0, pacotes_access_utils_1.resolvePackageViewerRole)({
        id: 10,
        idOrganizador: 42,
        viajantes: [{ idUser: 7 }],
    }, 99), null);
});
(0, node_test_1.test)('filterTravelerTrips removes duplicates already present in organizer trips', () => {
    assert.deepEqual((0, pacotes_access_utils_1.filterTravelerTrips)([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 3 }, { id: 4 }]), [{ id: 3 }, { id: 4 }]);
});
