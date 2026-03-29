"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const assert = require("node:assert/strict");
const common_1 = require("@nestjs/common");
const ownership_utils_1 = require("../src/auth/ownership.utils");
(0, node_test_1.test)('assertValidNumericId returns the numeric id when valid', () => {
    assert.equal((0, ownership_utils_1.assertValidNumericId)(12, 'idOrganizador'), 12);
});
(0, node_test_1.test)('assertValidNumericId rejects empty ids', () => {
    assert.throws(() => (0, ownership_utils_1.assertValidNumericId)(0, 'idOrganizador'), (error) => error instanceof common_1.BadRequestException &&
        error.message === 'idOrganizador invalido');
});
(0, node_test_1.test)('assertOwnership allows access for the same owner', () => {
    assert.doesNotThrow(() => (0, ownership_utils_1.assertOwnership)(7, 7, () => new common_1.ForbiddenException('sem permissao')));
});
(0, node_test_1.test)('assertOwnership rejects access for a different owner', () => {
    assert.throws(() => (0, ownership_utils_1.assertOwnership)(7, 9, () => new common_1.ForbiddenException('sem permissao')), (error) => error instanceof common_1.ForbiddenException && error.message === 'sem permissao');
});
(0, node_test_1.test)('findOwnedPackageOrThrow returns the package when the organizer owns it', async () => {
    const prisma = {
        pacoteViagem: {
            findUnique: async () => ({ id: 15, idOrganizador: 4 }),
        },
    };
    const result = await (0, ownership_utils_1.findOwnedPackageOrThrow)(prisma, 15, 4, () => new common_1.NotFoundException('pacote nao encontrado para este organizador'));
    assert.deepEqual(result, { id: 15, idOrganizador: 4 });
});
(0, node_test_1.test)('findOwnedPackageOrThrow hides packages from another organizer', async () => {
    const prisma = {
        pacoteViagem: {
            findUnique: async () => ({ id: 15, idOrganizador: 99 }),
        },
    };
    await assert.rejects((0, ownership_utils_1.findOwnedPackageOrThrow)(prisma, 15, 4, () => new common_1.NotFoundException('pacote nao encontrado para este organizador')), (error) => error instanceof common_1.NotFoundException &&
        error.message === 'pacote nao encontrado para este organizador');
});
(0, node_test_1.test)('findOwnedPackageOrThrow rejects invalid organizer ids before querying ownership', async () => {
    const prisma = {
        pacoteViagem: {
            findUnique: async () => ({ id: 15, idOrganizador: 4 }),
        },
    };
    await assert.rejects((0, ownership_utils_1.findOwnedPackageOrThrow)(prisma, 15, Number.NaN, () => new common_1.NotFoundException('pacote nao encontrado para este organizador')), (error) => error instanceof common_1.BadRequestException &&
        error.message === 'idOrganizador invalido');
});
