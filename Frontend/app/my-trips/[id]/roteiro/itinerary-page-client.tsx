"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  mapPayloadToTripItineraryDraft,
  serializeTripItineraryDraft,
  TripItineraryEditor,
  type TripItineraryPayload,
} from "../../../components/trip-itinerary-editor";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001/api";

export function ItineraryPageClient({
  packageId,
  initialData,
}: {
  packageId: number;
  initialData: TripItineraryPayload;
}) {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <TripItineraryEditor
      initialDraft={mapPayloadToTripItineraryDraft(initialData)}
      canEdit={initialData.canEdit}
      description={
        initialData.canEdit
          ? "Organize a viagem por cronograma de carona, hospedagem, passeios e alimentacao."
          : "Confira o cronograma organizado pelo organizador da viagem."
      }
      onSave={
        initialData.canEdit
          ? async (draft) => {
              if (!session?.backendAccessToken) {
                throw new Error("Sua sessao nao possui token do backend.");
              }

              const response = await fetch(`${backendUrl}/pacotes/${packageId}/roteiro`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.backendAccessToken}`,
                },
                body: JSON.stringify(serializeTripItineraryDraft(draft)),
              });

              if (!response.ok) {
                const data = (await response.json().catch(() => null)) as
                  | { message?: string | string[] }
                  | null;
                const message = Array.isArray(data?.message)
                  ? data.message.join(", ")
                  : data?.message;
                throw new Error(message ?? "Nao foi possivel salvar o roteiro.");
              }

              router.refresh();
            }
          : undefined
      }
    />
  );
}
