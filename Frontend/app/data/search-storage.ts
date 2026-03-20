export const SEARCH_STORAGE_KEY = "gomigo_search_draft";

export type SearchDraft = {
  cidadePartida: string;
  cidadeDestino: string;
  tipo: string;
  dataInicio: string;
  dataFim: string;
};

export const defaultSearchDraft: SearchDraft = {
  cidadePartida: "",
  cidadeDestino: "",
  tipo: "ROTEIRO_COMPLETO",
  dataInicio: "",
  dataFim: "",
};

export function readSearchDraft() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(SEARCH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SearchDraft;
  } catch {
    return null;
  }
}

export function writeSearchDraft(draft: SearchDraft) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(draft));
}
