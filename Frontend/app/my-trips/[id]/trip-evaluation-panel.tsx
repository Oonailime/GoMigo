"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import styles from "./trip-details.module.css";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001/api";

type PendingEvaluation = {
  tipo: "ORGANIZADOR" | "VIAJANTE";
  idUserAvaliado: number;
};

type TripEvaluationPanelProps = {
  packageId: number;
  organizer: {
    id: number;
    name: string;
  };
  travelers: Array<{
    idUser: number;
    user: {
      id: number;
      name: string;
    };
  }>;
};

export function TripEvaluationPanel({
  packageId,
  organizer,
  travelers,
}: TripEvaluationPanelProps) {
  const { data: session } = useSession();
  const [status, setStatus] = useState<"loading" | "ready" | "hidden" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingEvaluation[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);

  const peopleById = useMemo(() => {
    const map = new Map<number, string>();
    map.set(organizer.id, organizer.name);
    travelers.forEach((traveler) => {
      map.set(traveler.idUser, traveler.user.name);
    });
    return map;
  }, [organizer.id, organizer.name, travelers]);

  const loadPending = async () => {
    if (!session?.backendAccessToken) {
      setStatus("hidden");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch(`${backendUrl}/avaliacoes/pendentes/${packageId}`, {
        headers: {
          Authorization: `Bearer ${session.backendAccessToken}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { message?: string | string[] }
          | null;
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;

        if (response.status === 403) {
          setStatus("hidden");
          return;
        }

        setStatus("error");
        setError(message ?? "Nao foi possivel carregar as avaliacoes pendentes.");
        return;
      }

      const data = (await response.json()) as {
        avaliacoesPendentes: PendingEvaluation[];
      };

      setPending(data.avaliacoesPendentes);
      setStatus("ready");
    } catch {
      setStatus("error");
      setError("Falha de conexao ao carregar as avaliacoes pendentes.");
    }
  };

  useEffect(() => {
    void loadPending();
  }, [packageId, session?.backendAccessToken]);

  const submitEvaluation = async (evaluation: PendingEvaluation) => {
    if (!session?.backendAccessToken) {
      setError("Sua sessao nao possui token do backend.");
      return;
    }

    const evaluationKey = `${evaluation.tipo}:${evaluation.idUserAvaliado}`;
    setSubmittingKey(evaluationKey);
    setError(null);

    try {
      const response = await fetch(`${backendUrl}/avaliacoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.backendAccessToken}`,
        },
        body: JSON.stringify({
          tipo: evaluation.tipo,
          idPacoteViagem: packageId,
          idUserAvaliado: evaluation.idUserAvaliado,
          nota: score,
          comentario: comment.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { message?: string | string[] }
          | null;
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;
        setError(message ?? "Nao foi possivel enviar a avaliacao.");
        return;
      }

      setSelectedKey(null);
      setScore(5);
      setComment("");
      await loadPending();
    } catch {
      setError("Falha de conexao ao enviar a avaliacao.");
    } finally {
      setSubmittingKey(null);
    }
  };

  if (status === "hidden") {
    return null;
  }

  return (
    <article className={`${styles.card} ${styles.cardWide}`}>
      <h2 className={styles.cardTitle}>Avaliacoes da viagem</h2>

      {status === "loading" ? (
        <p className={styles.cardText}>Carregando avaliacoes disponiveis...</p>
      ) : null}

      {status === "error" ? <p className={styles.errorText}>{error}</p> : null}

      {status === "ready" && pending.length === 0 ? (
        <p className={styles.cardText}>Nao ha avaliacoes pendentes para este pacote.</p>
      ) : null}

      {status === "ready" ? (
        <div className={styles.evaluationList}>
          {pending.map((evaluation) => {
            const evaluationKey = `${evaluation.tipo}:${evaluation.idUserAvaliado}`;
            const isOpen = selectedKey === evaluationKey;
            const label =
              evaluation.tipo === "ORGANIZADOR" ? "Avaliar organizador" : "Avaliar viajante";
            const personName =
              peopleById.get(evaluation.idUserAvaliado) ?? `Usuario ${evaluation.idUserAvaliado}`;

            return (
              <div key={evaluationKey} className={styles.evaluationItem}>
                <div className={styles.evaluationHeader}>
                  <div>
                    <strong className={styles.evaluationTitle}>{label}</strong>
                    <p className={styles.cardText}>{personName}</p>
                  </div>

                  <button
                    type="button"
                    className={styles.primaryLink}
                    onClick={() => {
                      setSelectedKey(isOpen ? null : evaluationKey);
                      setScore(5);
                      setComment("");
                    }}
                  >
                    {label}
                  </button>
                </div>

                {isOpen ? (
                  <div className={styles.evaluationForm}>
                    <label className={styles.fieldStack}>
                      <span className={styles.cardText}>Nota</span>
                      <select
                        className={styles.selectField}
                        value={score}
                        onChange={(event) => setScore(Number(event.target.value))}
                      >
                        {[5, 4, 3, 2, 1].map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className={styles.fieldStack}>
                      <span className={styles.cardText}>Comentario</span>
                      <textarea
                        className={styles.textAreaField}
                        rows={3}
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        placeholder="Descreva brevemente sua experiencia."
                      />
                    </label>

                    <div className={styles.evaluationActions}>
                      <button
                        type="button"
                        className={styles.secondaryLink}
                        onClick={() => setSelectedKey(null)}
                      >
                        Fechar
                      </button>
                      <button
                        type="button"
                        className={styles.primaryLink}
                        disabled={submittingKey === evaluationKey}
                        onClick={() => void submitEvaluation(evaluation)}
                      >
                        {submittingKey === evaluationKey ? "Enviando..." : label}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {error && status === "ready" ? <p className={styles.errorText}>{error}</p> : null}
    </article>
  );
}
