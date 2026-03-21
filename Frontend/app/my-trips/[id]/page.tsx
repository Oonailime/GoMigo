import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { MyTripsHeaderActions } from "../../components/my-trips-header-actions";
import { TripCancelActions } from "./trip-cancel-actions";
import { TripEvaluationPanel } from "./trip-evaluation-panel";
import styles from "./trip-details.module.css";

const backendUrl =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:3001/api";

type TripDetails = {
  id: number;
  titulo: string;
  descricao?: string | null;
  status: string;
  privacidade: string;
  viewerRole?: "ORGANIZADOR" | "VIAJANTE";
  regrasViagem: string;
  vagas: number;
  valorPorPessoaPrevisto?: number | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  enderecoPartida: { cidade: string; estado: string };
  enderecoDestino: { cidade: string; estado: string };
  organizador: {
    id: number;
    name: string;
    email: string;
    phoneNumber?: string | null;
  };
  viajantes: Array<{
    idUser: number;
    user: {
      id: number;
      name: string;
      email: string;
      phoneNumber?: string | null;
    };
  }>;
};

export default async function MyTripDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const resolvedParams = await params;

  if (!session) {
    redirect("/login");
  }

  if (session.backendUserStatus === "INCOMPLETE" || !session.backendAccessToken) {
    redirect("/complete-profile");
  }

  const response = await fetch(`${backendUrl}/pacotes/${resolvedParams.id}/detalhes`, {
    headers: {
      Authorization: `Bearer ${session.backendAccessToken}`,
    },
    cache: "no-store",
  });

  if (response.status === 404 || response.status === 403) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Falha ao carregar detalhes do pacote.");
  }

  const trip = (await response.json()) as TripDetails;
  const sessionUserId = normalizeId(session.backendUserId);
  const organizerId = normalizeId(trip.organizador.id);
  const isOrganizer =
    trip.viewerRole === "ORGANIZADOR" ||
    (sessionUserId !== null && organizerId !== null && sessionUserId === organizerId);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <span className={styles.badge}>GoMigo</span>
            <h1 className={styles.title}>{trip.titulo}</h1>
            <p className={styles.subtitle}>
              Detalhes completos do pacote disponiveis apenas para organizador e viajantes.
            </p>
          </div>
          <MyTripsHeaderActions />
        </header>

        <section className={styles.heroCard}>
          <div className={styles.heroTop}>
            <div>
              <p className={styles.route}>
                {trip.enderecoPartida.cidade} - {trip.enderecoPartida.estado} /{" "}
                {trip.enderecoDestino.cidade} - {trip.enderecoDestino.estado}
              </p>
              <p className={styles.meta}>
                {formatDate(trip.dataInicio)} ate {formatDate(trip.dataFim)} / {trip.vagas} vagas /{" "}
                {formatPrice(trip.valorPorPessoaPrevisto)}
              </p>
            </div>
            <span className={styles.status}>{trip.status}</span>
          </div>

          {trip.descricao ? <p className={styles.description}>{trip.descricao}</p> : null}

          <div className={styles.actionRow}>
            <Link href="/my-trips" className={styles.secondaryLink}>
              Voltar para minhas viagens
            </Link>
            {isOrganizer ? (
              <Link href={`/travel-package/new?edit=${trip.id}`} className={styles.primaryLink}>
                Gerenciar pacote
              </Link>
            ) : null}
          </div>

          <TripCancelActions
            packageId={trip.id}
            organizerId={organizerId ?? trip.organizador.id}
            initialIsOrganizer={isOrganizer}
            isPublicPackage={trip.privacidade !== "PRIVADO"}
          />
        </section>

        <section className={styles.grid}>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Organizador</h2>
            <p className={styles.cardText}>{trip.organizador.name}</p>
            <p className={styles.cardText}>{trip.organizador.email}</p>
            {trip.organizador.phoneNumber ? (
              <p className={styles.cardText}>{trip.organizador.phoneNumber}</p>
            ) : null}
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Regras da viagem</h2>
            <p className={styles.cardText}>{trip.regrasViagem}</p>
          </article>

          <article className={`${styles.card} ${styles.cardWide}`}>
            <h2 className={styles.cardTitle}>Grupo de viajantes</h2>
            <div className={styles.participants}>
              {trip.viajantes.length === 0 ? (
                <p className={styles.cardText}>Ainda nao ha viajantes ativos neste pacote.</p>
              ) : (
                trip.viajantes.map((item) => (
                  <div key={item.idUser} className={styles.participant}>
                    <strong>{item.user.name}</strong>
                    <span>{item.user.email}</span>
                    {item.user.phoneNumber ? <span>{item.user.phoneNumber}</span> : null}
                  </div>
                ))
              )}
            </div>
          </article>

          <TripEvaluationPanel
            packageId={trip.id}
            organizer={{
              id: trip.organizador.id,
              name: trip.organizador.name,
            }}
            travelers={trip.viajantes}
          />
        </section>
      </div>
    </main>
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

function formatPrice(value?: number | null) {
  if (typeof value !== "number") {
    return "Preco sob consulta";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function normalizeId(value?: number | string | null) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = typeof value === "number" ? value : Number(value);
  return Number.isNaN(normalized) ? null : normalized;
}
