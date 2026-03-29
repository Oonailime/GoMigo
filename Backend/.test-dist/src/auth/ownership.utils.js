"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidNumericId = assertValidNumericId;
exports.assertOwnership = assertOwnership;
exports.findOwnedPackageOrThrow = findOwnedPackageOrThrow;
const common_1 = require("@nestjs/common");
function assertValidNumericId(value, label) {
    if (!value || Number.isNaN(value)) {
        throw new common_1.BadRequestException(`${label} invalido`);
    }
    return value;
}
function assertOwnership(resourceOwnerId, currentUserId, buildError, currentUserLabel = 'idOrganizador') {
    assertValidNumericId(currentUserId, currentUserLabel);
    if (resourceOwnerId !== currentUserId) {
        throw buildError();
    }
}
async function findOwnedPackageOrThrow(prisma, idPacoteViagem, idOrganizador, buildOwnershipError) {
    assertValidNumericId(idOrganizador, 'idOrganizador');
    const pacote = await prisma.pacoteViagem.findUnique({
        where: { id: idPacoteViagem },
        select: { id: true, idOrganizador: true },
    });
    if (!pacote) {
        throw buildOwnershipError();
    }
    assertOwnership(pacote.idOrganizador, idOrganizador, buildOwnershipError);
    return pacote;
}
