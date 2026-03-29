"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmptyTripItineraryDraft = createEmptyTripItineraryDraft;
exports.mapPayloadToTripItineraryDraft = mapPayloadToTripItineraryDraft;
exports.serializeTripItineraryDraft = serializeTripItineraryDraft;
exports.toDateTimeLocal = toDateTimeLocal;
function createEmptyTripItineraryDraft() {
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
function mapPayloadToTripItineraryDraft(payload) {
    return {
        roteiro: {
            titulo: payload?.roteiro?.titulo ?? "Roteiro da viagem",
            descricao: payload?.roteiro?.descricao ?? "",
        },
        caronas: payload?.caronas?.map((item) => ({
            id: item.id,
            origem: item.origem ?? "",
            destino: item.destino ?? "",
            dataIda: item.dataIda ? toDateTimeLocal(item.dataIda) : "",
            dataVolta: item.dataVolta ? toDateTimeLocal(item.dataVolta) : "",
            precoPorPessoa: typeof item.precoPorPessoa === "number" ? String(item.precoPorPessoa) : "",
            regrasCarona: item.regrasCarona ?? "",
            status: item.status ?? "PLANEJADA",
        })) ?? [],
        hospedagens: payload?.hospedagens?.map((item) => ({
            id: item.id,
            nomeLocal: item.nomeLocal ?? "",
            local: item.local ?? "",
            dataCheckin: item.dataCheckin ? toDateTimeLocal(item.dataCheckin) : "",
            dataCheckout: item.dataCheckout ? toDateTimeLocal(item.dataCheckout) : "",
            precoPorPessoa: typeof item.precoPorPessoa === "number" ? String(item.precoPorPessoa) : "",
            regrasHospedagem: item.regrasHospedagem ?? "",
            statusReserva: item.statusReserva ?? "PLANEJADA",
        })) ?? [],
        atividades: payload?.atividades?.map((item) => ({
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
function serializeTripItineraryDraft(draft) {
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
function toDateTimeLocal(value) {
    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60_000);
    return localDate.toISOString().slice(0, 16);
}
