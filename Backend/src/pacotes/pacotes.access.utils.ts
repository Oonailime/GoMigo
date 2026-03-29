export type PackageViewerRole = 'ORGANIZADOR' | 'VIAJANTE';

type ParticipantLike = { idUser: number };
type PackageAccessLike = {
  id: number;
  idOrganizador: number;
  viajantes: ParticipantLike[];
};

export function resolvePackageViewerRole(
  pacote: PackageAccessLike,
  idUser: number,
): PackageViewerRole | null {
  if (pacote.idOrganizador === idUser) {
    return 'ORGANIZADOR';
  }

  if (pacote.viajantes.some((viajante) => viajante.idUser === idUser)) {
    return 'VIAJANTE';
  }

  return null;
}

export function filterTravelerTrips<
  TOrganizer extends { id: number },
  TTraveler extends { id: number },
>(asOrganizer: TOrganizer[], asTraveler: TTraveler[]) {
  const organizerIds = new Set(asOrganizer.map((item) => item.id));
  return asTraveler.filter((item) => !organizerIds.has(item.id));
}
