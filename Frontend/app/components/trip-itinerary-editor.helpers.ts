export type ItineraryCaronaDraft = {
  id?: number;
  origem: string;
  destino: string;
  dataIda: string;
  dataVolta: string;
  precoPorPessoa: string;
  regrasCarona: string;
  status: string;
};

export type ItineraryHospedagemDraft = {
  id?: number;
  nomeLocal: string;
  local: string;
  dataCheckin: string;
  dataCheckout: string;
  precoPorPessoa: string;
  regrasHospedagem: string;
  statusReserva: string;
};

export type ItineraryAtividadeDraft = {
  id?: number;
  categoria: "PASSEIO_TURISMO" | "ALIMENTACAO";
  titulo: string;
  descricao: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  preco: string;
  local: string;
};

export type TripItineraryDraft = {
  roteiro: {
    titulo: string;
    descricao: string;
  };
  caronas: ItineraryCaronaDraft[];
  hospedagens: ItineraryHospedagemDraft[];
  atividades: ItineraryAtividadeDraft[];
};

export type TripItineraryPayload = {
  packageId: number;
  viewerRole?: "ORGANIZADOR" | "VIAJANTE";
  canEdit: boolean;
  roteiro: {
    id: number | null;
    titulo: string;
    descricao?: string | null;
  };
  caronas: Array<{
    id: number;
    origem?: string | null;
    destino?: string | null;
    dataIda?: string | null;
    dataVolta?: string | null;
    precoPorPessoa?: number | null;
    regrasCarona: string;
    status: string;
  }>;
  hospedagens: Array<{
    id: number;
    nomeLocal?: string | null;
    local?: string | null;
    dataCheckin?: string | null;
    dataCheckout?: string | null;
    precoPorPessoa?: number | null;
    regrasHospedagem: string;
    statusReserva: string;
  }>;
  atividades: Array<{
    id: number;
    categoria: "PASSEIO_TURISMO" | "ALIMENTACAO";
    titulo: string;
    descricao: string;
    dataHoraInicio: string;
    dataHoraFim: string;
    preco?: number | null;
    local?: string | null;
  }>;
  timeline: Array<{
    kind: "CARONA" | "HOSPEDAGEM" | "PASSEIO_TURISMO" | "ALIMENTACAO";
    id: number;
    title: string;
    startsAt?: string | null;
    endsAt?: string | null;
    subtitle?: string | null;
  }>;
};

export function createEmptyTripItineraryDraft(): TripItineraryDraft {
  return {
    roteiro: {
      titulo: "Roteiro da viagem",
      descricao: "",
    },
    caronas: [],
    hospedagens: [],
    atividades: [],
  };
}

export function mapPayloadToTripItineraryDraft(
  payload?: Partial<TripItineraryPayload> | null,
): TripItineraryDraft {
  return {
    roteiro: {
      titulo: payload?.roteiro?.titulo ?? "Roteiro da viagem",
      descricao: payload?.roteiro?.descricao ?? "",
    },
    caronas:
      payload?.caronas?.map((item) => ({
        id: item.id,
        origem: item.origem ?? "",
        destino: item.destino ?? "",
        dataIda: item.dataIda ? toDateTimeLocal(item.dataIda) : "",
        dataVolta: item.dataVolta ? toDateTimeLocal(item.dataVolta) : "",
        precoPorPessoa:
          typeof item.precoPorPessoa === "number" ? String(item.precoPorPessoa) : "",
        regrasCarona: item.regrasCarona ?? "",
        status: item.status ?? "PLANEJADA",
      })) ?? [],
    hospedagens:
      payload?.hospedagens?.map((item) => ({
        id: item.id,
        nomeLocal: item.nomeLocal ?? "",
        local: item.local ?? "",
        dataCheckin: item.dataCheckin ? toDateTimeLocal(item.dataCheckin) : "",
        dataCheckout: item.dataCheckout ? toDateTimeLocal(item.dataCheckout) : "",
        precoPorPessoa:
          typeof item.precoPorPessoa === "number" ? String(item.precoPorPessoa) : "",
        regrasHospedagem: item.regrasHospedagem ?? "",
        statusReserva: item.statusReserva ?? "PLANEJADA",
      })) ?? [],
    atividades:
      payload?.atividades?.map((item) => ({
        id: item.id,
        categoria: item.categoria,
        titulo: item.titulo,
        descricao: item.descricao ?? "",
        dataHoraInicio: toDateTimeLocal(item.dataHoraInicio),
        dataHoraFim: toDateTimeLocal(item.dataHoraFim),
        preco: typeof item.preco === "number" ? String(item.preco) : "",
        local: item.local ?? "",
      })) ?? [],
  };
}

export function serializeTripItineraryDraft(draft: TripItineraryDraft) {
  return {
    titulo: draft.roteiro.titulo.trim() || "Roteiro da viagem",
    descricao: draft.roteiro.descricao.trim() || undefined,
    caronas: draft.caronas
      .filter((item) => item.origem.trim() || item.destino.trim() || item.dataIda)
      .map((item) => ({
        id: item.id,
        origem: item.origem.trim() || undefined,
        destino: item.destino.trim() || undefined,
        dataIda: item.dataIda || undefined,
        dataVolta: item.dataVolta || undefined,
        precoPorPessoa: item.precoPorPessoa ? Math.round(Number(item.precoPorPessoa)) : undefined,
        regrasCarona: item.regrasCarona.trim() || undefined,
        status: item.status.trim() || undefined,
      })),
    hospedagens: draft.hospedagens
      .filter((item) => item.nomeLocal.trim() || item.local.trim() || item.dataCheckin)
      .map((item) => ({
        id: item.id,
        nomeLocal: item.nomeLocal.trim() || undefined,
        local: item.local.trim() || undefined,
        dataCheckin: item.dataCheckin || undefined,
        dataCheckout: item.dataCheckout || undefined,
        precoPorPessoa: item.precoPorPessoa ? Math.round(Number(item.precoPorPessoa)) : undefined,
        regrasHospedagem: item.regrasHospedagem.trim() || undefined,
        statusReserva: item.statusReserva.trim() || undefined,
      })),
    atividades: draft.atividades
      .filter((item) => item.titulo.trim() && item.dataHoraInicio && item.dataHoraFim)
      .map((item) => ({
        id: item.id,
        categoria: item.categoria,
        titulo: item.titulo.trim(),
        descricao: item.descricao.trim() || undefined,
        dataHoraInicio: item.dataHoraInicio,
        dataHoraFim: item.dataHoraFim,
        preco: item.preco ? Math.round(Number(item.preco)) : undefined,
        local: item.local.trim() || undefined,
      })),
  };
}

export function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}
