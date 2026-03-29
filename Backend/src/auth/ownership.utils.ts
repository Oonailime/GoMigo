import { BadRequestException } from '@nestjs/common';

type PackageOwnershipLookup = {
  pacoteViagem: {
    findUnique(args: {
      where: { id: number };
      select: { id: true; idOrganizador: true };
    }): Promise<{ id: number; idOrganizador: number } | null>;
  };
};

export function assertValidNumericId(value: number, label: string): number {
  if (!value || Number.isNaN(value)) {
    throw new BadRequestException(`${label} invalido`);
  }

  return value;
}

export function assertOwnership(
  resourceOwnerId: number,
  currentUserId: number,
  buildError: () => Error,
  currentUserLabel = 'idOrganizador',
): void {
  assertValidNumericId(currentUserId, currentUserLabel);

  if (resourceOwnerId !== currentUserId) {
    throw buildError();
  }
}

export async function findOwnedPackageOrThrow(
  prisma: PackageOwnershipLookup,
  idPacoteViagem: number,
  idOrganizador: number,
  buildOwnershipError: () => Error,
): Promise<{ id: number; idOrganizador: number }> {
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
