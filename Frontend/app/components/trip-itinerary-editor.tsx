"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { DayPicker } from "react-day-picker";
import fieldStyles from "../page.module.css";
import styles from "./trip-itinerary-editor.module.css";
import {
  createEmptyTripItineraryDraft,
  mapPayloadToTripItineraryDraft,
  serializeTripItineraryDraft,
  type ItineraryAtividadeDraft,
  type ItineraryCaronaDraft,
  type ItineraryHospedagemDraft,
  type TripItineraryDraft,
  type TripItineraryPayload,
} from "./trip-itinerary-editor.helpers";
import { useDismissibleLayer } from "./use-dismissible-layer";

export {
  createEmptyTripItineraryDraft,
  mapPayloadToTripItineraryDraft,
  serializeTripItineraryDraft,
  type ItineraryAtividadeDraft,
  type ItineraryCaronaDraft,
  type ItineraryHospedagemDraft,
  type TripItineraryDraft,
  type TripItineraryPayload,
} from "./trip-itinerary-editor.helpers";

function createEmptyCarona(): ItineraryCaronaDraft {
  return {
    origem: "",
    destino: "",
    dataIda: "",
    dataVolta: "",
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
                  <DateTimeField label="Data/hora de ida" value={item.dataIda} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "caronas", index, "dataIda", value)} />
                  <DateTimeField label="Data/hora de volta" value={item.dataVolta} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "caronas", index, "dataVolta", value)} />
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
                  <DateTimeField label="Check-in" value={item.dataCheckin} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "hospedagens", index, "dataCheckin", value)} />
                  <DateTimeField label="Checkout" value={item.dataCheckout} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "hospedagens", index, "dataCheckout", value)} />
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
                  <DateTimeField label="Inicio" value={item.dataHoraInicio} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "atividades", index, "dataHoraInicio", value)} />
                  <DateTimeField label="Fim" value={item.dataHoraFim} disabled={!canEdit} onChange={(value) => updateArrayField(setDraft, "atividades", index, "dataHoraFim", value)} />
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

function DateTimeField({
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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedDate = getDatePart(value);
  const selectedTime = getTimePart(value);

  useDismissibleLayer({
    isOpen,
    containerRef,
    onDismiss: () => setIsOpen(false),
  });

  const handleDateSelect = (date?: Date) => {
    onChange(mergeDateTime(toDateInputValue(date), selectedTime));
  };

  const handleTimeChange = (nextTime: string) => {
    onChange(mergeDateTime(selectedDate, nextTime));
  };

  return (
    <label className={styles.dateTimeField}>
      <span className={styles.label}>{label}</span>
      <div className={styles.dateTimeShell} ref={containerRef}>
        <button
          type="button"
          className={styles.dateTimeTrigger}
          onClick={() => {
            if (!disabled) {
              setIsOpen((currentValue) => !currentValue);
            }
          }}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          disabled={disabled}
        >
          <span className={value ? styles.dateTimeValue : styles.dateTimePlaceholder}>
            {value ? formatDateTime(value) : "Selecionar data e horario"}
          </span>
          <span className={styles.dateTimeBadge} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 3v3M16 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        {isOpen ? (
          <div className={styles.dateTimePanel} role="dialog" aria-label={label}>
            <div className={styles.dateTimePanelHeader}>
              <div>
                <p className={styles.dateTimePanelTitle}>{label}</p>
                <p className={styles.dateTimeHint}>Escolha a data e ajuste o horario.</p>
              </div>
            </div>

            <DayPicker
              mode="single"
              selected={selectedDate ? parseDateValue(selectedDate) : undefined}
              defaultMonth={selectedDate ? parseDateValue(selectedDate) : new Date()}
              onSelect={handleDateSelect}
              weekStartsOn={0}
              showOutsideDays
              className={styles.dateTimePicker}
              classNames={{
                months: styles.dateTimeMonths,
                month: styles.dateTimeMonth,
                month_caption: styles.dateTimeMonthCaption,
                caption_label: styles.dateTimeCaptionLabel,
                nav: styles.dateTimeNav,
                button_previous: styles.dateTimeNavButton,
                button_next: styles.dateTimeNavButton,
                weekdays: styles.dateTimeWeekdays,
                weekday: styles.dateTimeWeekday,
                week: styles.dateTimeWeek,
                day: styles.dateTimeDay,
                day_button: styles.dateTimeDayButton,
                selected: styles.dateTimeSelected,
                outside: styles.dateTimeOutside,
                today: styles.dateTimeToday,
                disabled: styles.dateTimeDisabled,
              }}
              formatters={{
                formatCaption: (date) =>
                  new Intl.DateTimeFormat("pt-BR", {
                    month: "long",
                    year: "numeric",
                  }).format(date),
                formatWeekdayName: (date) =>
                  new Intl.DateTimeFormat("pt-BR", {
                    weekday: "short",
                  })
                    .format(date)
                    .replace(".", ""),
              }}
            />

            <div className={styles.timeRow}>
              <span className={fieldStyles.fieldLabel}>Horario</span>
              <input
                className={styles.input}
                type="time"
                step="60"
                value={selectedTime}
                onChange={(event) => handleTimeChange(event.target.value)}
              />
            </div>

            <div className={styles.dateTimePanelFooter}>
              <span className={styles.dateTimeHint}>
                {selectedDate ? formatDateLabel(selectedDate) : "Nenhuma data escolhida"}
              </span>
              <button
                type="button"
                className={styles.dateTimeClose}
                onClick={() => setIsOpen(false)}
              >
                Aplicar
              </button>
            </div>
          </div>
        ) : null}
      </div>
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

function formatDateLabel(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return "Nenhuma data escolhida";
  }

  return `${day}/${month}/${year}`;
}

function parseDateValue(value: string) {
  return new Date(`${value}T12:00:00`);
}

function getDatePart(value: string) {
  return value.includes("T") ? value.slice(0, 10) : "";
}

function getTimePart(value: string) {
  return value.includes("T") ? value.slice(11, 16) : "";
}

function mergeDateTime(date: string, time: string) {
  if (!date) {
    return "";
  }

  return `${date}T${time || "00:00"}`;
}

function toDateInputValue(date?: Date) {
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}
