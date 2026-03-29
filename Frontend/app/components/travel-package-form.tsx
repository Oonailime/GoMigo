"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CityAutocomplete } from "./city-autocomplete";
import { DateRangeField } from "./date-range-field";
import {
  createEmptyTripItineraryDraft,
  serializeTripItineraryDraft,
  TripItineraryEditor,
  type TripItineraryDraft,
} from "./trip-itinerary-editor";
import {
  fetchBackend,
  fetchBackendJson,
  readApiErrorMessage,
} from "../lib/backend";
import styles from "./travel-package-form.module.css";

type TravelPackageFormState = {
  title: string;
  summary: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  seats: string;
  price: string;
  notes: string;
  privacy: "PUBLICO" | "PRIVADO";
};

type EditablePackage = {
  titulo: string;
  descricao?: string | null;
  vagas: number;
  valorPorPessoaPrevisto?: number | null;
  regrasViagem: string;
  dataInicio?: string | null;
  dataFim?: string | null;
  enderecoPartida?: { cidade: string; estado: string } | null;
  enderecoDestino?: { cidade: string; estado: string } | null;
};

const initialState: TravelPackageFormState = {
  title: "",
  summary: "",
  origin: "",
  destination: "",
  startDate: "",
  endDate: "",
  seats: "",
  price: "",
  notes: "",
  privacy: "PUBLICO",
};

const createAddressPayload = (value: string) => {
  const [cityPart, statePart] = value.split(" - ");
  const cidade = cityPart?.trim() || value.trim();
  const estado = statePart?.trim() || "Nao informado";

  return {
    rua: "Nao informado",
    cep: "00000000",
    cidade,
    estado,
  };
};

export function TravelPackageForm({
  editPackageId,
  initialPackage,
}: {
  editPackageId?: string | null;
  initialPackage?: EditablePackage | null;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [formState, setFormState] = useState<TravelPackageFormState>(() =>
    mapPackageToFormState(initialPackage),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [itineraryDraft, setItineraryDraft] = useState<TripItineraryDraft>(
    createEmptyTripItineraryDraft(),
  );
  const [itineraryVersion, setItineraryVersion] = useState(0);

  const updateField =
    (field: keyof TravelPackageFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormState((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleTravelStartDateChange = (value: string) => {
    setFormState((current) => ({
      ...current,
      startDate: value,
      endDate: current.endDate && value && current.endDate < value ? "" : current.endDate,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const backendAccessToken = session?.backendAccessToken;

    if (!backendAccessToken) {
      setError("Sua sessao nao possui token do backend. Entre novamente.");
      return;
    }

    if (!formState.origin.includes(" - ") || !formState.destination.includes(" - ")) {
      setError("Selecione origem e destino a partir das sugestoes de municipios.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const [
        { response: originResponse, data: originAddress },
        { response: destinationResponse, data: destinationAddress },
      ] = await Promise.all([
        fetchBackendJson<{ id: number }>("/enderecos", {
          method: "POST",
          token: backendAccessToken,
          headers: {
            "Content-Type": "application/json",
          },
          json: createAddressPayload(formState.origin),
        }),
        fetchBackendJson<{ id: number }>("/enderecos", {
          method: "POST",
          token: backendAccessToken,
          headers: {
            "Content-Type": "application/json",
          },
          json: createAddressPayload(formState.destination),
        }),
      ]);

      if (!originResponse.ok || !destinationResponse.ok || !originAddress || !destinationAddress) {
        setError("Nao foi possivel cadastrar os enderecos do pacote.");
        return;
      }

      const payload = {
        idEnderecoPartida: originAddress.id,
        idEnderecoDestino: destinationAddress.id,
        titulo: formState.title.trim(),
        descricao: formState.summary.trim() || undefined,
        tipoPacoteViagem: "COMPARTILHADO",
        status: "ATIVO",
        vagas: Number(formState.seats),
        regrasViagem: formState.notes.trim() || "Regras a combinar com o grupo.",
        valorPorPessoaPrevisto: formState.price ? Math.round(Number(formState.price)) : undefined,
        dataInicio: formState.startDate || undefined,
        dataFim: formState.endDate || undefined,
        privacidade: editPackageId ? undefined : formState.privacy,
      };

      const packageResponse = await fetchBackend(
        `/pacotes${editPackageId ? `/${editPackageId}` : ""}`,
        {
          method: editPackageId ? "PATCH" : "POST",
          token: backendAccessToken,
          headers: {
            "Content-Type": "application/json",
          },
          json: payload,
        },
      );

      if (!packageResponse.ok) {
        setError(await readApiErrorMessage(packageResponse, "Nao foi possivel publicar o pacote."));
        return;
      }

      const savedPackage = (await packageResponse.json()) as { id: number };

      if (!editPackageId) {
        const itineraryPayload = serializeTripItineraryDraft(itineraryDraft);
        const hasInitialItinerary =
          itineraryPayload.caronas.length > 0 ||
          itineraryPayload.hospedagens.length > 0 ||
          itineraryPayload.atividades.length > 0 ||
          Boolean(itineraryPayload.descricao);

        if (hasInitialItinerary) {
          const itineraryResponse = await fetchBackend(
            `/pacotes/${savedPackage.id}/roteiro`,
            {
              method: "PUT",
              token: backendAccessToken,
              headers: {
                "Content-Type": "application/json",
              },
              json: itineraryPayload,
            },
          );

          if (!itineraryResponse.ok) {
            setError(
              await readApiErrorMessage(
                itineraryResponse,
                "Pacote criado, mas nao foi possivel salvar o roteiro inicial.",
              ),
            );
            return;
          }
        }
      }

      setFormState(initialState);
      setItineraryDraft(createEmptyTripItineraryDraft());
      setItineraryVersion((current) => current + 1);
      setSuccessMessage(
        editPackageId
          ? "Pacote atualizado com sucesso. Redirecionando..."
          : "Pacote publicado com sucesso. Redirecionando...",
      );
      router.push("/travel-package");
      router.refresh();
    } catch {
      setError("Falha de conexao com o backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>Nome do pacote</span>
          <input
            className={styles.input}
            type="text"
            placeholder="Ex.: Serra do Cipo com amigos"
            value={formState.title}
            onChange={updateField("title")}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Resumo</span>
          <input
            className={styles.input}
            type="text"
            placeholder="Caronas, hospedagem e roteiro em 4 dias"
            value={formState.summary}
            onChange={updateField("summary")}
          />
        </label>

        <div className={styles.autocompleteField}>
          <CityAutocomplete
            label="Origem"
            value={formState.origin}
            onChange={(value) =>
              setFormState((current) => ({ ...current, origin: value }))
            }
            placeholder="Ex.: Sao Paulo - SP"
            helperText="Selecione um municipio sugerido para manter o pacote encontravel."
          />
        </div>

        <div className={styles.autocompleteField}>
          <CityAutocomplete
            label="Destino"
            value={formState.destination}
            onChange={(value) =>
              setFormState((current) => ({ ...current, destination: value }))
            }
            placeholder="Ex.: Belo Horizonte - MG"
            helperText="Use a mesma base de cidades da busca."
          />
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Vagas</span>
          <input
            className={styles.input}
            type="number"
            min={1}
            placeholder="Ex.: 12"
            value={formState.seats}
            onChange={updateField("seats")}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Preco por pessoa (R$)</span>
          <input
            className={styles.input}
            type="number"
            min={0}
            step="0.01"
            placeholder="Ex.: 890"
            value={formState.price}
            onChange={updateField("price")}
            required
          />
        </label>
      </div>

      {!editPackageId ? (
        <div className={styles.field}>
          <span className={styles.label}>Visibilidade do pacote</span>
          <div className={styles.privacyOptions}>
            <button
              type="button"
              className={`${styles.privacyButton} ${
                formState.privacy === "PUBLICO" ? styles.privacyButtonActive : ""
              }`}
              onClick={() =>
                setFormState((current) => ({ ...current, privacy: "PUBLICO" }))
              }
            >
              Publico
            </button>
            <button
              type="button"
              className={`${styles.privacyButton} ${
                formState.privacy === "PRIVADO" ? styles.privacyButtonActive : ""
              }`}
              onClick={() =>
                setFormState((current) => ({ ...current, privacy: "PRIVADO" }))
              }
            >
              Privado
            </button>
          </div>
          <span className={styles.labelHint}>
            Essa opcao so pode ser definida na criacao do pacote.
          </span>
        </div>
      ) : null}

      <DateRangeField
        startDate={formState.startDate}
        endDate={formState.endDate}
        onStartDateChange={handleTravelStartDateChange}
        onEndDateChange={(value) =>
          setFormState((current) => ({ ...current, endDate: value }))
        }
      />

      <label className={styles.field}>
        <span className={styles.label}>Observacoes</span>
        <textarea
          className={styles.textarea}
          rows={4}
          placeholder="Inclua detalhes de hospedagem, roteiro ou regras do grupo."
          value={formState.notes}
          onChange={updateField("notes")}
        />
      </label>

      {!editPackageId ? (
        <TripItineraryEditor
          initialDraft={itineraryDraft}
          version={itineraryVersion}
          canEdit
          title="Roteiro inicial da viagem"
          description="Opcional. Antecipe caronas, hospedagem, passeios e alimentacao ja na criacao do pacote."
          onChange={setItineraryDraft}
        />
      ) : null}

      {error ? <p className={styles.error}>{error}</p> : null}
      {successMessage ? <p className={styles.success}>{successMessage}</p> : null}

      <div className={styles.actions}>
        {/*
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => setFormState(initialState)}
          disabled={isSubmitting}
        >
          Salvar rascunho
        </button>
        */}
        <button
          type="submit"
          className={styles.primaryButton}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? editPackageId
              ? "Salvando..."
              : "Publicando..."
            : editPackageId
              ? "Salvar alteracoes"
              : "Publicar pacote"}
        </button>
      </div>
    </form>
  );
}

function mapPackageToFormState(pkg?: EditablePackage | null): TravelPackageFormState {
  if (!pkg) {
    return initialState;
  }

  return {
    title: pkg.titulo ?? "",
    summary: pkg.descricao ?? "",
    origin: pkg.enderecoPartida
      ? `${pkg.enderecoPartida.cidade} - ${pkg.enderecoPartida.estado}`
      : "",
    destination: pkg.enderecoDestino
      ? `${pkg.enderecoDestino.cidade} - ${pkg.enderecoDestino.estado}`
      : "",
    startDate: pkg.dataInicio?.slice(0, 10) ?? "",
    endDate: pkg.dataFim?.slice(0, 10) ?? "",
    seats: pkg.vagas ? String(pkg.vagas) : "",
    price: pkg.valorPorPessoaPrevisto ? String(pkg.valorPorPessoaPrevisto) : "",
    notes: pkg.regrasViagem ?? "",
    privacy: "PUBLICO",
  };
}
