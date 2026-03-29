import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { MyTripsHeaderActions } from "../../../components/my-trips-header-actions";
import { ItineraryPageClient } from "./itinerary-page-client";
import type { TripItineraryPayload } from "../../../components/trip-itinerary-editor";
import { fetchServerBackend } from "../../../lib/backend";
import styles from "./roteiro.module.css";

type TripSummary = {
  id: number;
  titulo: string;
  viewerRole?: "ORGANIZADOR" | "VIAJANTE";
};

export default async function TripItineraryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const resolvedParams = await params;

  if (!session) {
    redirect("/login");
  }

  if (session.backendAuthError === "BACKEND_AUTH_FAILED" || !session.backendAccessToken) {
    redirect("/login");
  }

  if (session.backendUserStatus === "INCOMPLETE") {
    redirect("/complete-profile");
  }

  const [tripResponse, itineraryResponse] = await Promise.all([
    fetchServerBackend(`/pacotes/${resolvedParams.id}/detalhes`, {
      token: session.backendAccessToken,
      cache: "no-store",
    }),
    fetchServerBackend(`/pacotes/${resolvedParams.id}/roteiro`, {
      token: session.backendAccessToken,
      cache: "no-store",
    }),
  ]);

  if (
    tripResponse.status === 404 ||
    tripResponse.status === 403 ||
    itineraryResponse.status === 404 ||
    itineraryResponse.status === 403
  ) {
    notFound();
  }

  if (!tripResponse.ok || !itineraryResponse.ok) {
    throw new Error("Falha ao carregar o roteiro da viagem.");
  }

  const trip = (await tripResponse.json()) as TripSummary;
  const itinerary = (await itineraryResponse.json()) as TripItineraryPayload;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <span className={styles.badge}>GoMigo</span>
            <h1 className={styles.title}>Roteiro da viagem</h1>
            <p className={styles.subtitle}>
              {trip.titulo} /{" "}
              {itinerary.canEdit
                ? "Voce pode organizar e atualizar o cronograma completo."
                : "Voce pode acompanhar o cronograma publicado pelo organizador."}
            </p>
          </div>
          <MyTripsHeaderActions />
        </header>

        <div className={styles.topActions}>
          <Link href={`/my-trips/${trip.id}`} className={styles.backLink}>
            Voltar para detalhes da viagem
          </Link>
          {trip.viewerRole === "ORGANIZADOR" ? (
            <Link href={`/travel-package/new?edit=${trip.id}`} className={styles.manageLink}>
              Editar pacote
            </Link>
          ) : null}
        </div>

        <ItineraryPageClient packageId={trip.id} initialData={itinerary} />
      </div>
    </main>
  );
}
