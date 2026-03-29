"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSearchDraft = exports.SEARCH_STORAGE_KEY = void 0;
exports.readSearchDraft = readSearchDraft;
exports.writeSearchDraft = writeSearchDraft;
exports.SEARCH_STORAGE_KEY = "gomigo_search_draft";
exports.defaultSearchDraft = {
    cidadePartida: "",
    cidadeDestino: "",
    tipo: "ROTEIRO_COMPLETO",
    dataInicio: "",
    dataFim: "",
};
function readSearchDraft() {
    if (typeof window === "undefined") {
        return null;
    }
    const raw = window.localStorage.getItem(exports.SEARCH_STORAGE_KEY);
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
function writeSearchDraft(draft) {
    if (typeof window === "undefined") {
        return;
    }
    window.localStorage.setItem(exports.SEARCH_STORAGE_KEY, JSON.stringify(draft));
}
