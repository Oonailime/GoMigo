"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import styles from "./my-packages-panel.module.css";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001/api";

type Solicitation = {
  id: number;
  statusSolicitacao: string;
  mensagemSolicitacao?: string | null;
  motivoRecusa?: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    phoneNumber?: string | null;
  };
};

type PackageItem = {
  id: number;
  titulo: string;
  descricao?: string | null;
  status: string;
  vagas: number;
  enderecoPartida: {
    cidade: string;
    estado: string;
  };
  enderecoDestino: {
    cidade: string;
    estado: string;
  };
  solicitacoesParticipacao: Solicitation[];
  viajantes: Array<{ idUser: number }>;
};

export function MyPackagesPanel() {
  const { data: session } = useSession();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const totalPending = packages.reduce(
    (sum, item) =>
      sum +
      item.solicitacoesParticipacao.filter(
        (solicitation) => solicitation.statusSolicitacao === "PENDENTE",
      ).length,
    0,
  );

  const loadPackages = async () => {
    if (!session?.backendAccessToken) {
      setStatus("error");
      setError("Sua sessao nao possui token do backend.");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch(`${backendUrl}/pacotes/meus`, {
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
        setStatus("error");
        setError(message ?? "Nao foi possivel carregar seus pacotes.");
        return;
      }

      const data = (await response.json()) as PackageItem[];
      setPackages(data);
      setStatus("ready");
    } catch {
      setStatus("error");
      setError("Falha de conexao ao carregar os pacotes.");
    }
  };

  useEffect(() => {
    void loadPackages();
  }, [session?.backendAccessToken]);

  const handleDecision = async (
    solicitationId: number,
    action: "aceitar" | "rejeitar",
  ) => {
    if (!session?.backendAccessToken) {
      setError("Sua sessao nao possui token do backend.");
      return;
    }

    setProcessingId(solicitationId);
    setError(null);

    try {
      const response = await fetch(
        `${backendUrl}/solicitacoes/${solicitationId}/${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.backendAccessToken}`,
          },
          body:
            action === "rejeitar"
              ? JSON.stringify({ motivoRecusa: "Solicitacao recusada pelo organizador." })
              : JSON.stringify({}),
        },
      );

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { message?: string | string[] }
          | null;
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;
        setError(message ?? "Nao foi possivel processar a solicitacao.");
        return;
      }

      await loadPackages();
    } catch {
      setError("Falha de conexao ao processar a solicitacao.");
    } finally {
      setProcessingId(null);
    }
  };

  if (status === "loading") {
    return <section className={styles.state}>Carregando pacotes publicados...</section>;
  }

  if (status === "error") {
    return <section className={styles.state}>{error}</section>;
  }

  if (packages.length === 0) {
    return (
      <section className={styles.emptyState}>
        <h2 className={styles.emptyTitle}>Nenhum pacote publicado ainda</h2>
        <p className={styles.emptyText}>
          Voce ainda nao criou pacotes. Publique o primeiro para comecar a receber solicitacoes.
        </p>
        <Link href="/travel-package/new" className={styles.primaryLink}>
          Criar pacote
        </Link>
      </section>
    );
  }

  return (
    <section className={styles.list}>
      <div className={styles.overview}>
        <strong className={styles.overviewValue}>{totalPending}</strong>
        <span className={styles.overviewLabel}>solicitacoes pendentes</span>
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
      {packages.map((item) => (
        <article key={item.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>{item.titulo}</h2>
              <p className={styles.cardMeta}>
                {item.enderecoPartida.cidade} - {item.enderecoPartida.estado}
                <span className={styles.arrow}> / </span>
                {item.enderecoDestino.cidade} - {item.enderecoDestino.estado}
              </p>
            </div>

            <div className={styles.metrics}>
              <span className={styles.metric}>{item.status}</span>
              <span className={styles.metric}>
                {item.viajantes.length}/{item.vagas} participantes
              </span>
            </div>
          </div>

          <div className={styles.packageActions}>
            <Link href={`/travel-package/new?edit=${item.id}`} className={styles.editLink}>
              Editar pacote
            </Link>
            <Link href={`/my-trips/${item.id}`} className={styles.detailsLink}>
              Detalhes da viagem
            </Link>
          </div>

          {item.descricao ? (
            <p className={styles.description}>{item.descricao}</p>
          ) : null}

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Solicitacoes de participacao</h3>
              <span className={styles.counter}>
                {
                  item.solicitacoesParticipacao.filter(
                    (solicitation) => solicitation.statusSolicitacao === "PENDENTE",
                  ).length
                }{" "}
                pendentes
              </span>
            </div>

            {item.solicitacoesParticipacao.length === 0 ? (
              <p className={styles.sectionEmpty}>
                Ainda nao ha solicitacoes para este pacote.
              </p>
            ) : (
              <div className={styles.solicitations}>
                {item.solicitacoesParticipacao.map((solicitation) => (
                  <div key={solicitation.id} className={styles.solicitation}>
                    <div className={styles.solicitationInfo}>
                      <strong className={styles.applicantName}>
                        {solicitation.user.name || solicitation.user.email}
                      </strong>
                      <span className={styles.applicantMeta}>
                        {solicitation.user.email}
                      </span>
                      {solicitation.user.phoneNumber ? (
                        <span className={styles.applicantMeta}>
                          {solicitation.user.phoneNumber}
                        </span>
                      ) : null}
                      {solicitation.mensagemSolicitacao ? (
                        <p className={styles.message}>
                          {solicitation.mensagemSolicitacao}
                        </p>
                      ) : null}
                      {solicitation.motivoRecusa ? (
                        <p className={styles.rejectionReason}>
                          Motivo da recusa: {solicitation.motivoRecusa}
                        </p>
                      ) : null}
                    </div>

                    <div className={styles.solicitationActions}>
                      <span
                        className={`${styles.statusBadge} ${
                          solicitation.statusSolicitacao === "ACEITA"
                            ? styles.accepted
                            : solicitation.statusSolicitacao === "REJEITADA"
                              ? styles.rejected
                              : styles.pending
                        }`}
                      >
                        {solicitation.statusSolicitacao}
                      </span>

                      {solicitation.statusSolicitacao === "PENDENTE" ? (
                        <div className={styles.actionRow}>
                          <button
                            type="button"
                            className={styles.approveButton}
                            disabled={processingId === solicitation.id}
                            onClick={() =>
                              void handleDecision(solicitation.id, "aceitar")
                            }
                          >
                            Aceitar
                          </button>
                          <button
                            type="button"
                            className={styles.rejectButton}
                            disabled={processingId === solicitation.id}
                            onClick={() =>
                              void handleDecision(solicitation.id, "rejeitar")
                            }
                          >
                            Rejeitar
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
