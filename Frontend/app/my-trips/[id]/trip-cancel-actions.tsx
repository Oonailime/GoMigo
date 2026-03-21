"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import styles from "./trip-details.module.css";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001/api";

type TripCancelActionsProps = {
  packageId: number;
  organizerId: number;
  initialIsOrganizer: boolean;
  isPublicPackage: boolean;
};

export function TripCancelActions({
  packageId,
  organizerId,
  initialIsOrganizer,
  isPublicPackage,
}: TripCancelActionsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionUserId = normalizeId(session?.backendUserId);
  const resolvedIsOrganizer =
    sessionUserId !== null ? sessionUserId === organizerId : initialIsOrganizer;

  const warningMessage = resolvedIsOrganizer
    ? isPublicPackage
      ? "Excluir este pacote publico tambem impacta a sua taxa de cancelamento de viagem. Deseja continuar?"
      : "Tem certeza de que deseja excluir este pacote inteiro?"
    : isPublicPackage
      ? "Cancelar sua reserva em um pacote publico tambem impacta a taxa de cancelamento de viagem. Deseja continuar?"
      : "Tem certeza de que deseja cancelar sua reserva neste pacote?";

  const helperText = resolvedIsOrganizer
    ? isPublicPackage
      ? "Ao excluir um pacote publico, a viagem inteira sera cancelada e isso afeta sua taxa de cancelamento."
      : "Ao excluir o pacote, todos os viajantes perdem acesso a esta viagem."
    : isPublicPackage
      ? "Ao cancelar sua reserva em um pacote publico, a plataforma considera esse cancelamento na taxa de cancelamento de viagem."
      : "Ao cancelar sua reserva, voce deixa de participar desta viagem.";

  const handleCancel = async () => {
    if (!session?.backendAccessToken) {
      setError("Sua sessao nao possui token do backend.");
      return;
    }

    if (!window.confirm(warningMessage)) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        resolvedIsOrganizer
          ? `${backendUrl}/pacotes/${packageId}`
          : `${backendUrl}/pacotes/${packageId}/reserva`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.backendAccessToken}`,
          },
        },
      );

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { message?: string | string[] }
          | null;
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;
        setError(message ?? "Nao foi possivel concluir o cancelamento.");
        return;
      }

      router.replace("/my-trips");
      router.refresh();
    } catch {
      setError("Falha de conexao ao concluir o cancelamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.cancelPanel}>
      <p className={styles.warningText}>{helperText}</p>
      <button
        type="button"
        className={styles.dangerButton}
        disabled={isSubmitting}
        onClick={() => void handleCancel()}
      >
        {isSubmitting
          ? "Processando..."
          : resolvedIsOrganizer
            ? "Excluir pacote"
            : "Cancelar reserva"}
      </button>
      {error ? <p className={styles.errorText}>{error}</p> : null}
    </div>
  );
}

function normalizeId(value?: number | string | null) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = typeof value === "number" ? value : Number(value);
  return Number.isNaN(normalized) ? null : normalized;
}
