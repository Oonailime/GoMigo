import { formatCityLabel } from './pacotes.utils';

type AddressLike = {
  cidade?: string | null;
  estado?: string | null;
} | null;

type CaronaLike = {
  id: number;
  enderecoPartida?: AddressLike;
  enderecoDestino?: AddressLike;
  dataIda?: Date | null;
  dataVolta?: Date | null;
  precoPorPessoa?: number | null;
  regrasCarona: string;
  status: string;
};

type HospedagemLike = {
  id: number;
  nomeLocal?: string | null;
  endereco?: AddressLike;
  dataCheckin?: Date | null;
  dataCheckout?: Date | null;
  precoPorPessoa?: number | null;
  regrasHospedagem: string;
  statusReserva: string;
};

type AtividadeLike = {
  id: number;
  titulo: string;
  descricao?: string | null;
  dataHoraInicio: Date;
  dataHoraFim: Date;
  preco?: number | null;
  endereco?: AddressLike;
  categoriaAtividade?: { nome?: string | null } | null;
};

type RoteiroLike = {
  id?: number | null;
  titulo?: string | null;
  descricao?: string | null;
} | null;

function mapAtividadeCategoria(nome?: string | null) {
  return nome === 'Alimentacao' ? 'ALIMENTACAO' : 'PASSEIO_TURISMO';
}

export function mapRoteiroHeader(roteiro: RoteiroLike) {
  return {
    id: roteiro?.id ?? null,
    titulo: roteiro?.titulo ?? 'Roteiro da viagem',
    descricao: roteiro?.descricao ?? null,
  };
}

export function mapCaronasForItinerary(caronas: CaronaLike[]) {
  return caronas.map((item) => ({
    id: item.id,
    origem: item.enderecoPartida ? formatCityLabel(item.enderecoPartida) : null,
    destino: item.enderecoDestino ? formatCityLabel(item.enderecoDestino) : null,
    dataIda: item.dataIda?.toISOString() ?? null,
    dataVolta: item.dataVolta?.toISOString() ?? null,
    precoPorPessoa: item.precoPorPessoa ?? null,
    regrasCarona: item.regrasCarona,
    status: item.status,
  }));
}

export function mapHospedagensForItinerary(hospedagens: HospedagemLike[]) {
  return hospedagens.map((item) => ({
    id: item.id,
    nomeLocal: item.nomeLocal ?? null,
    local: item.endereco ? formatCityLabel(item.endereco) : null,
    dataCheckin: item.dataCheckin?.toISOString() ?? null,
    dataCheckout: item.dataCheckout?.toISOString() ?? null,
    precoPorPessoa: item.precoPorPessoa ?? null,
    regrasHospedagem: item.regrasHospedagem,
    statusReserva: item.statusReserva,
  }));
}

export function mapAtividadesForItinerary(atividades: AtividadeLike[]) {
  return atividades.map((item) => ({
    id: item.id,
    categoria: mapAtividadeCategoria(item.categoriaAtividade?.nome),
    titulo: item.titulo,
    descricao: item.descricao ?? null,
    dataHoraInicio: item.dataHoraInicio.toISOString(),
    dataHoraFim: item.dataHoraFim.toISOString(),
    preco: item.preco ?? null,
    local: item.endereco ? formatCityLabel(item.endereco) : null,
  }));
}

export function buildItineraryTimeline(
  caronas: CaronaLike[],
  hospedagens: HospedagemLike[],
  atividades: AtividadeLike[],
) {
  return [
    ...caronas.map((item) => ({
      kind: 'CARONA' as const,
      id: item.id,
      title: `${formatCityLabel(item.enderecoPartida ?? undefined)} -> ${formatCityLabel(item.enderecoDestino ?? undefined)}`,
      startsAt: item.dataIda?.toISOString() ?? null,
      endsAt: item.dataVolta?.toISOString() ?? null,
      subtitle: item.regrasCarona,
    })),
    ...hospedagens.map((item) => ({
      kind: 'HOSPEDAGEM' as const,
      id: item.id,
      title: item.nomeLocal ?? 'Hospedagem',
      startsAt: item.dataCheckin?.toISOString() ?? null,
      endsAt: item.dataCheckout?.toISOString() ?? null,
      subtitle: item.endereco ? formatCityLabel(item.endereco) : item.regrasHospedagem,
    })),
    ...atividades.map((item) => ({
      kind: mapAtividadeCategoria(item.categoriaAtividade?.nome) as 'ALIMENTACAO' | 'PASSEIO_TURISMO',
      id: item.id,
      title: item.titulo,
      startsAt: item.dataHoraInicio.toISOString(),
      endsAt: item.dataHoraFim.toISOString(),
      subtitle: item.endereco ? formatCityLabel(item.endereco) : item.descricao ?? null,
    })),
  ].sort((a, b) => {
    const left = a.startsAt ? new Date(a.startsAt).getTime() : Number.MAX_SAFE_INTEGER;
    const right = b.startsAt ? new Date(b.startsAt).getTime() : Number.MAX_SAFE_INTEGER;
    return left - right;
  });
}
