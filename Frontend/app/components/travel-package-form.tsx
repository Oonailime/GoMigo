"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import styles from "./travel-package-form.module.css";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001/api";

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

export function TravelPackageForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [formState, setFormState] = useState<TravelPackageFormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const updateField =
    (field: keyof TravelPackageFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormState((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.backendAccessToken) {
      setError("Sua sessao nao possui token do backend. Entre novamente.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const [originResponse, destinationResponse] = await Promise.all([
        fetch(`${backendUrl}/enderecos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createAddressPayload(formState.origin)),
        }),
        fetch(`${backendUrl}/enderecos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createAddressPayload(formState.destination)),
        }),
      ]);

      if (!originResponse.ok || !destinationResponse.ok) {
        setError("Nao foi possivel cadastrar os enderecos do pacote.");
        return;
      }

      const originAddress = (await originResponse.json()) as { id: number };
      const destinationAddress = (await destinationResponse.json()) as { id: number };

      const packageResponse = await fetch(`${backendUrl}/pacotes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.backendAccessToken}`,
        },
        body: JSON.stringify({
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
          privacidade: "PUBLICO",
        }),
      });

      if (!packageResponse.ok) {
        const data = (await packageResponse.json().catch(() => null)) as
          | { message?: string | string[] }
          | null;
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;

        setError(message ?? "Nao foi possivel publicar o pacote.");
        return;
      }

      setFormState(initialState);
      setSuccessMessage("Pacote publicado com sucesso.");
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

        <label className={styles.field}>
          <span className={styles.label}>Origem</span>
          <input
            className={styles.input}
            type="text"
            placeholder="Ex.: Sao Paulo"
            value={formState.origin}
            onChange={updateField("origin")}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Destino</span>
          <input
            className={styles.input}
            type="text"
            placeholder="Ex.: Belo Horizonte"
            value={formState.destination}
            onChange={updateField("destination")}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Ida</span>
          <input
            className={styles.input}
            type="date"
            value={formState.startDate}
            onChange={updateField("startDate")}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Volta</span>
          <input
            className={styles.input}
            type="date"
            value={formState.endDate}
            onChange={updateField("endDate")}
            required
          />
        </label>

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

      {error ? <p className={styles.error}>{error}</p> : null}
      {successMessage ? <p className={styles.success}>{successMessage}</p> : null}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => setFormState(initialState)}
          disabled={isSubmitting}
        >
          Salvar rascunho
        </button>
        <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
          {isSubmitting ? "Publicando..." : "Publicar pacote"}
        </button>
      </div>
    </form>
  );
}
