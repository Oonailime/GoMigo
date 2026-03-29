"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const trip_itinerary_editor_helpers_1 = require("../app/components/trip-itinerary-editor.helpers");
(0, node_test_1.default)("createEmptyTripItineraryDraft returns the expected default structure", () => {
    strict_1.default.deepEqual((0, trip_itinerary_editor_helpers_1.createEmptyTripItineraryDraft)(), {
        roteiro: {
            titulo: "Roteiro da viagem",
            descricao: "",
        },
        caronas: [],
        hospedagens: [],
        atividades: [],
    });
});
(0, node_test_1.default)("mapPayloadToTripItineraryDraft maps backend payload to editable draft", () => {
    const draft = (0, trip_itinerary_editor_helpers_1.mapPayloadToTripItineraryDraft)({
        roteiro: {
            id: 1,
            titulo: "Roteiro Serra",
            descricao: "Fim de semana",
        },
        canEdit: true,
        packageId: 10,
        timeline: [],
        caronas: [
            {
                id: 9,
                origem: "Salvador - BA",
                destino: "Lençois - BA",
                dataIda: "2026-06-12T09:30:00.000Z",
                dataVolta: "2026-06-14T18:15:00.000Z",
                precoPorPessoa: 150,
                regrasCarona: "Chegar 15 min antes",
                status: "PLANEJADA",
            },
        ],
        hospedagens: [],
        atividades: [
            {
                id: 7,
                categoria: "ALIMENTACAO",
                titulo: "Jantar",
                descricao: "Restaurante local",
                dataHoraInicio: "2026-06-12T22:00:00.000Z",
                dataHoraFim: "2026-06-12T23:30:00.000Z",
                preco: 80,
                local: "Centro",
            },
        ],
    });
    strict_1.default.equal(draft.roteiro.titulo, "Roteiro Serra");
    strict_1.default.equal(draft.caronas[0]?.origem, "Salvador - BA");
    strict_1.default.match(draft.caronas[0]?.dataIda ?? "", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    strict_1.default.equal(draft.caronas[0]?.precoPorPessoa, "150");
    strict_1.default.equal(draft.atividades[0]?.preco, "80");
});
(0, node_test_1.default)("serializeTripItineraryDraft trims fields, filters incomplete entries and rounds prices", () => {
    const payload = (0, trip_itinerary_editor_helpers_1.serializeTripItineraryDraft)({
        roteiro: {
            titulo: "   ",
            descricao: "  descricao final  ",
        },
        caronas: [
            {
                origem: " Salvador - BA ",
                destino: " Lençois - BA ",
                dataIda: "2026-06-12T09:30",
                dataVolta: "",
                precoPorPessoa: "149.6",
                regrasCarona: "  bagagem pequena  ",
                status: " PLANEJADA ",
            },
            {
                origem: "  ",
                destino: " ",
                dataIda: "",
                dataVolta: "",
                precoPorPessoa: "",
                regrasCarona: "",
                status: "",
            },
        ],
        hospedagens: [
            {
                nomeLocal: " Pousada Azul ",
                local: " Lençois - BA ",
                dataCheckin: "2026-06-12T14:00",
                dataCheckout: "2026-06-14T12:00",
                precoPorPessoa: "499.2",
                regrasHospedagem: "  cafe incluso ",
                statusReserva: " CONFIRMADA ",
            },
        ],
        atividades: [
            {
                categoria: "PASSEIO_TURISMO",
                titulo: " Trilha da Fumaca ",
                descricao: " ",
                dataHoraInicio: "2026-06-13T08:00",
                dataHoraFim: "2026-06-13T16:00",
                preco: "220.4",
                local: " Vale do Capao ",
            },
            {
                categoria: "ALIMENTACAO",
                titulo: " ",
                descricao: "Nao deve entrar",
                dataHoraInicio: "2026-06-13T19:00",
                dataHoraFim: "",
                preco: "20",
                local: "Centro",
            },
        ],
    });
    strict_1.default.equal(payload.titulo, "Roteiro da viagem");
    strict_1.default.equal(payload.descricao, "descricao final");
    strict_1.default.equal(payload.caronas.length, 1);
    strict_1.default.equal(payload.caronas[0]?.origem, "Salvador - BA");
    strict_1.default.equal(payload.caronas[0]?.precoPorPessoa, 150);
    strict_1.default.equal(payload.caronas[0]?.regrasCarona, "bagagem pequena");
    strict_1.default.equal(payload.caronas[0]?.status, "PLANEJADA");
    strict_1.default.equal(payload.hospedagens[0]?.precoPorPessoa, 499);
    strict_1.default.equal(payload.atividades.length, 1);
    strict_1.default.equal(payload.atividades[0]?.titulo, "Trilha da Fumaca");
    strict_1.default.equal(payload.atividades[0]?.preco, 220);
    strict_1.default.equal(payload.atividades[0]?.descricao, undefined);
});
