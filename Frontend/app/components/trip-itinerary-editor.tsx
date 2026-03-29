"use client";

import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import styles from "./trip-itinerary-editor.module.css";

export type ItineraryCaronaDraft = {
  id?: number;
  origem: string;
  destino: string;
  dataIda: string;
  dataVolta: string;
  vagasDisponiveis: string;
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
    vagasDisponiveis?: number | null;
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

function createEmptyCarona(): ItineraryCaronaDraft {
  return {
    origem: "",
    destino: "",
    dataIda: "",
    dataVolta: "",
    vagasDisponiveis: "",
    precoPorPessoa: "",
    regrasCarona: "",
    status: "PLANEJADA",
  };
}

function createEmptyHospedagem(): ItineraryHospedagemDraft {
  return {
    nomeLocal: "",
    local: "",
    dataCheckin: "",
    dataCheckout: "",
    precoPorPessoa: "",
    regrasHospedagem: "",
    statusReserva: "PLANEJADA",
  };
}

function createEmptyAtividade(
  categoria: "PASSEIO_TURISMO" | "ALIMENTACAO" = "PASSEIO_TURISMO",
): ItineraryAtividadeDraft {
  return {
    categoria,
    titulo: "",
    descricao: "",
    dataHoraInicio: "",
    dataHoraFim: "",
    preco: "",
    local: "",
  };
}

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
        vagasDisponiveis:
          typeof item.vagasDisponiveis === "number" ? String(item.vagasDisponiveis) : "",
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
        vagasDisponiveis: item.vagasDisponiveis ? Number(item.vagasDisponiveis) : undefined,
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

export function TripItineraryEditor({
  initialDraft,
  version = 0,
  canEdit,
  onChange,
  onSave,
  saveLabel = "Salvar roteiro",
  savingLabel = "Salvando roteiro...",
  title = "Roteiro da viagem",
  description,
}: {
  initialDraft: TripItineraryDraft;
  version?: number;
  canEdit: boolean;
  onChange?: (draft: TripItineraryDraft) => void;
  onSave?: (draft: TripItineraryDraft) => Promise<void>;
  saveLabel?: string;
  savingLabel?: string;
  title?: string;
  description?: string;
}) {
  const [draft, setDraft] = useState<TripItineraryDraft>(initialDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(initialDraft);
  }, [version]);

  useEffect(() => {
    onChange?.(draft);
  }, [draft, onChange]);

  const timeline = useMemo(() => {
    return [
      ...draft.caronas.map((item, index) => ({
        key: `carona-${item.id ?? index}`,
        kind: "Carona",
        title: `${item.origem || "Origem"} -> ${item.destino || "Destino"}`,
        startsAt: item.dataIda,
        subtitle: item.regrasCarona || "Transporte planejado para a viagem.",
      })),
      ...draft.hospedagens.map((item, index) => ({
        key: `hospedagem-${item.id ?? index}`,
        kind: "Hospedagem",
        title: item.nomeLocal || "Hospedagem",
        startsAt: item.dataCheckin,
        subtitle: item.local || item.regrasHospedagem || "Estadia planejada.",
      })),
      ...draft.atividades.map((item, index) => ({
        key: `atividade-${item.id ?? index}`,
        kind: item.categoria === "ALIMENTACAO" ? "Alimentacao" : "Passeio/Turismo",
        title: item.titulo || "Atividade",
        startsAt: item.dataHoraInicio,
        subtitle: item.local || item.descricao || "Atividade planejada para o grupo.",
      })),
    ].sort((a, b) => {
      const left = a.startsAt ? new Date(a.startsAt).getTime() : Number.MAX_SAFE_INTEGER;
      const right = b.startsAt ? new Date(b.startsAt).getTime() : Number.MAX_SAFE_INTEGER;
      return left - right;
    });
  }, [draft]);

  const updateRoteiroField =
    (field: keyof TripItineraryDraft["roteiro"]) =>
    (value: string) => {
      setDraft((current) => ({
        ...current,
        roteiro: {
          ...current.roteiro,
          [field]: value,
        },
      }));
    };

  const handleSave = async () => {
    if (!onSave) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setFeedback(null);

    try {
      await onSave(draft);
      setFeedback("Roteiro salvo com sucesso.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Falha ao salvar o roteiro.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
        {canEdit && onSave ? (
          <button
            type="button"
            className={styles.saveButton}
            onClick={() => void handleSave()}
            disabled={isSaving}
          >
            {isSaving ? savingLabel : saveLabel}
          </button>
        ) : null}
      </div>

      <div className={styles.metaCard}>
        <label className={styles.field}>
          <span className={styles.label}>Titulo do roteiro</span>
          <input
            className={styles.input}
            value={draft.roteiro.titulo}
            onChange={(event) => updateRoteiroField("titulo")(event.target.value)}
            disabled={!canEdit}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Descricao geral</span>
          <textarea
            className={styles.textarea}
            rows={3}
            value={draft.roteiro.descricao}
            onChange={(event) => updateRoteiroField("descricao")(event.target.value)}
            disabled={!canEdit}
          />
        </label>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}
      {feedback ? <p className={styles.success}>{feedback}</p> : null}

      <div className={styles.grid}>
        <EditorGroup
          title="Carona"
          helper="Planeje os deslocamentos principais do grupo."
          canEdit={canEdit}
          onAdd={() =>
            setDraft((current) => ({ ...current, caronas: [...current.caronas, createEmptyCarona()] }))
          }
        >
          {draft.caronas.length === 0 ? (
            <p className={styles.empty}>Nenhuma carona planejada.</p>
          ) : (
            draft.caronas.map((item, index) => (
              <div key={`carona-${item.id ?? index}`} className={styles.entryCard}>
                {canEdit ? (
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        caronas: current.caronas.filter((_, itemIndex) => itemIndex !== index),
                      }))
                    }
                  >
                    Remover
                  </button>
                ) : null}
                <TwoColumnFields>
                  <InputField label="Origem" value={item.origem} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "caronas", index, "origem", value)} />
                  <InputField label="Destino" value={item.destino} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "caronas", index, "destino", value)} />
                  <InputField label="Data/hora de ida" type="datetime-local" value={item.dataIda} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "caronas", index, "dataIda", value)} />
                  <InputField label="Data/hora de volta" type="datetime-local" value={item.dataVolta} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "caronas", index, "dataVolta", value)} />
                  <InputField label="Vagas disponiveis" type="number" value={item.vagasDisponiveis} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "caronas", index, "vagasDisponiveis", value)} />
                  <InputField label="Preco por pessoa" type="number" value={item.precoPorPessoa} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "caronas", index, "precoPorPessoa", value)} />
                </TwoColumnFields>
                <TextAreaField label="Regras da carona" value={item.regrasCarona} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "caronas", index, "regrasCarona", value)} />
              </div>
            ))
          )}
        </EditorGroup>

        <EditorGroup
          title="Hospedagem"
          helper="Organize estadias, check-in e regras."
          canEdit={canEdit}
          onAdd={() =>
            setDraft((current) => ({
              ...current,
              hospedagens: [...current.hospedagens, createEmptyHospedagem()],
            }))
          }
        >
          {draft.hospedagens.length === 0 ? (
            <p className={styles.empty}>Nenhuma hospedagem planejada.</p>
          ) : (
            draft.hospedagens.map((item, index) => (
              <div key={`hospedagem-${item.id ?? index}`} className={styles.entryCard}>
                {canEdit ? (
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        hospedagens: current.hospedagens.filter((_, itemIndex) => itemIndex !== index),
                      }))
                    }
                  >
                    Remover
                  </button>
                ) : null}
                <TwoColumnFields>
                  <InputField label="Local" value={item.nomeLocal} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "hospedagens", index, "nomeLocal", value)} />
                  <InputField label="Cidade/estado" value={item.local} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "hospedagens", index, "local", value)} />
                  <InputField label="Check-in" type="datetime-local" value={item.dataCheckin} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "hospedagens", index, "dataCheckin", value)} />
                  <InputField label="Checkout" type="datetime-local" value={item.dataCheckout} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "hospedagens", index, "dataCheckout", value)} />
                  <InputField label="Preco por pessoa" type="number" value={item.precoPorPessoa} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "hospedagens", index, "precoPorPessoa", value)} />
                </TwoColumnFields>
                <TextAreaField label="Regras da hospedagem" value={item.regrasHospedagem} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "hospedagens", index, "regrasHospedagem", value)} />
              </div>
            ))
          )}
        </EditorGroup>

        <EditorGroup
          title="Passeios e alimentacao"
          helper="Monte passeios, refeicoes e momentos importantes do cronograma."
          canEdit={canEdit}
          onAdd={() =>
            setDraft((current) => ({
              ...current,
              atividades: [...current.atividades, createEmptyAtividade()],
            }))
          }
        >
          {draft.atividades.length === 0 ? (
            <p className={styles.empty}>Nenhuma atividade planejada.</p>
          ) : (
            draft.atividades.map((item, index) => (
              <div key={`atividade-${item.id ?? index}`} className={styles.entryCard}>
                {canEdit ? (
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        atividades: current.atividades.filter((_, itemIndex) => itemIndex !== index),
                      }))
                    }
                  >
                    Remover
                  </button>
                ) : null}
                <TwoColumnFields>
                  <label className={styles.field}>
                    <span className={styles.label}>Categoria</span>
                    <select
                      className={styles.input}
                      value={item.categoria}
                      onChange={(event) =>
                        updateArrayField(
                          setDraft,
                          "atividades",
                          index,
                          "categoria",
                          event.target.value as "PASSEIO_TURISMO" | "ALIMENTACAO",
                        )
                      }
                      disabled={!canEdit}
                    >
                      <option value="PASSEIO_TURISMO">Passeio/Turismo</option>
                      <option value="ALIMENTACAO">Alimentacao</option>
                    </select>
                  </label>
                  <InputField label="Titulo" value={item.titulo} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "atividades", index, "titulo", value)} />
                  <InputField label="Inicio" type="datetime-local" value={item.dataHoraInicio} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "atividades", index, "dataHoraInicio", value)} />
                  <InputField label="Fim" type="datetime-local" value={item.dataHoraFim} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "atividades", index, "dataHoraFim", value)} />
                  <InputField label="Local" value={item.local} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "atividades", index, "local", value)} />
                  <InputField label="Preco" type="number" value={item.preco} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "atividades", index, "preco", value)} />
                </TwoColumnFields>
                <TextAreaField label="Descricao" value={item.descricao} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "atividades", index, "descricao", value)} />
              </div>
            ))
          )}
        </EditorGroup>
      </div>

      <section className={styles.timelineSection}>
        <div className={styles.timelineHeader}>
          <h3 className={styles.timelineTitle}>Cronograma consolidado</h3>
          <span className={styles.timelineCount}>{timeline.length} itens</span>
        </div>

        {timeline.length === 0 ? (
          <p className={styles.empty}>O cronograma aparecera aqui conforme o roteiro for preenchido.</p>
        ) : (
          <div className={styles.timelineList}>
            {timeline.map((item) => (
              <div key={item.key} className={styles.timelineItem}>
                <span className={styles.timelineKind}>{item.kind}</span>
                <div>
                  <strong className={styles.timelineItemTitle}>{item.title}</strong>
                  <p className={styles.timelineItemMeta}>
                    {item.startsAt ? formatDateTime(item.startsAt) : "Horario a definir"}
                  </p>
                  <p className={styles.timelineItemText}>{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function EditorGroup({
  title,
  helper,
  canEdit,
  onAdd,
  children,
}: {
  title: string;
  helper: string;
  canEdit: boolean;
  onAdd: () => void;
  children: ReactNode;
}) {
  return (
    <article className={styles.group}>
      <div className={styles.groupHeader}>
        <div>
          <h3 className={styles.groupTitle}>{title}</h3>
          <p className={styles.groupHelper}>{helper}</p>
        </div>
        {canEdit ? (
          <button type="button" className={styles.addButton} onClick={onAdd}>
            Adicionar
          </button>
        ) : null}
      </div>
      {children}
    </article>
  );
}

function TwoColumnFields({ children }: { children: ReactNode }) {
  return <div className={styles.twoColumn}>{children}</div>;
}

function InputField({
  label,
  value,
  onChange,
  disabled,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  type?: string;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input
        className={styles.input}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <textarea
        className={styles.textarea}
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
    </label>
  );
}

function updateArrayField<T extends keyof Pick<TripItineraryDraft, "caronas" | "hospedagens" | "atividades">>(
  setDraft: Dispatch<SetStateAction<TripItineraryDraft>>,
  key: T,
  index: number,
  field: keyof TripItineraryDraft[T][number],
  value: string,
) {
  setDraft((current) => ({
    ...current,
    [key]: current[key].map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    ),
  }));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}
