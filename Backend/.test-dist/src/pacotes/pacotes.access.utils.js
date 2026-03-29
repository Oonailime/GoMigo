"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePackageViewerRole = resolvePackageViewerRole;
exports.filterTravelerTrips = filterTravelerTrips;
function resolvePackageViewerRole(pacote, idUser) {
    if (pacote.idOrganizador === idUser) {
        return 'ORGANIZADOR';
    }
    if (pacote.viajantes.some((viajante) => viajante.idUser === idUser)) {
        return 'VIAJANTE';
    }
    return null;
}
function filterTravelerTrips(asOrganizer, asTraveler) {
    const organizerIds = new Set(asOrganizer.map((item) => item.id));
    return asTraveler.filter((item) => !organizerIds.has(item.id));
}
