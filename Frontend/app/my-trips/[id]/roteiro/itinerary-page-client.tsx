"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  mapPayloadToTripItineraryDraft,
  serializeTripItineraryDraft,
  TripItineraryEditor,
  type TripItineraryPayload,
} from "../../../components/trip-itinerary-editor";
import {
  fetchBackend,
  readApiErrorMessage,
} from "../../../lib/backend";

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

              const response = await fetchBackend(`/pacotes/${packageId}/roteiro`, {
                method: "PUT",
                token: session.backendAccessToken,
                headers: {
                  "Content-Type": "application/json",
                },
                json: serializeTripItineraryDraft(draft),
              });

              if (!response.ok) {
                throw new Error(
                  await readApiErrorMessage(response, "Nao foi possivel salvar o roteiro."),
                );
              }

              router.refresh();
            }
          : undefined
      }
    />
  );
}
