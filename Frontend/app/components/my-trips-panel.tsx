"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import styles from "./my-trips-panel.module.css";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001/api";

type TripItem = {
  id: number;
  titulo: string;
  descricao?: string | null;
  status: string;
  dataInicio?: string | null;
  dataFim?: string | null;
  enderecoPartida: {
    cidade: string;
    estado: string;
  };
  enderecoDestino: {
    cidade: string;
    estado: string;
  };
};

type TripsResponse = {
  asOrganizer: TripItem[];
  asTraveler: TripItem[];
};

export function MyTripsPanel() {
  const { data: session } = useSession();
  const [data, setData] = useState<TripsResponse>({ asOrganizer: [], asTraveler: [] });
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.backendAccessToken) {
      setStatus("error");
      setError("Sua sessao nao possui token do backend.");
      return;
    }

    let active = true;

    const loadTrips = async () => {
      setStatus("loading");
      setError(null);

      try {
        const response = await fetch(`${backendUrl}/pacotes/minhas-viagens`, {
          headers: {
            Authorization: `Bearer ${session.backendAccessToken}`,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error();
        }

        const payload = (await response.json()) as TripsResponse;

        if (active) {
          setData(payload);
          setStatus("ready");
        }
      } catch {
        if (active) {
          setStatus("error");
          setError("Nao foi possivel carregar suas viagens.");
        }
      }
    };

    void loadTrips();

    return () => {
      active = false;
    };
  }, [session?.backendAccessToken]);

  if (status === "loading") {
    return <section className={styles.state}>Carregando viagens...</section>;
  }

  if (status === "error") {
    return <section className={styles.state}>{error}</section>;
  }

  return (
    <section className={styles.layout}>
      <TripSection
        title="Pacotes geridos por mim"
        description="Viagens onde voce e o organizador."
        items={data.asOrganizer}
        emptyMessage="Voce ainda nao esta gerindo nenhum pacote."
        actionLabel="Gerenciar pacote"
        actionHref={(id) => `/travel-package/new?edit=${id}`}
      />

      <TripSection
        title="Minhas viagens"
        description="Pacotes em que voce participa como viajante."
        items={data.asTraveler}
        emptyMessage="Voce ainda nao participa de nenhuma viagem."
        actionLabel="Ver detalhes do pacote"
        actionHref={(id) => `/my-trips/${id}`}
      />
    </section>
  );
}

function TripSection({
  title,
  description,
  items,
  emptyMessage,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  items: TripItem[];
  emptyMessage: string;
  actionLabel: string;
  actionHref: (id: number) => string;
}) {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>{title}</h2>
          <p className={styles.sectionDescription}>{description}</p>
        </div>
        <span className={styles.counter}>{items.length}</span>
      </header>

      {items.length === 0 ? (
        <div className={styles.emptyState}>{emptyMessage}</div>
      ) : (
        <div className={styles.cards}>
          {items.map((item) => (
            <article key={item.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>{item.titulo}</h3>
                  <p className={styles.cardRoute}>
                    {item.enderecoPartida.cidade} - {item.enderecoPartida.estado} /{" "}
                    {item.enderecoDestino.cidade} - {item.enderecoDestino.estado}
                  </p>
                </div>
                <span className={styles.status}>{item.status}</span>
              </div>

              {item.descricao ? (
                <p className={styles.cardDescription}>{item.descricao}</p>
              ) : null}

              <div className={styles.cardFooter}>
                <span className={styles.cardDate}>
                  {formatDate(item.dataInicio)} ate {formatDate(item.dataFim)}
                </span>
                <Link href={actionHref(item.id)} className={styles.actionLink}>
                  {actionLabel}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Data a combinar";
  }

  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}
