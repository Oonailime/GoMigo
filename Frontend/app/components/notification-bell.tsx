"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useDismissibleLayer } from "./use-dismissible-layer";
import styles from "./notification-bell.module.css";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001/api";

type NotificationPayload = {
  total: number;
  totalPendentes: number;
  totalRespostas: number;
  organizerNotifications: Array<{
    id: number;
    user: { name?: string | null; email: string };
    pacoteViagem: { id: number; titulo: string };
  }>;
  travelerNotifications: Array<{
    id: number;
    statusSolicitacao: string;
    motivoRecusa?: string | null;
    pacoteViagem: { id: number; titulo: string };
  }>;
};

const DISMISSED_NOTIFICATIONS_KEY = "gomigo_dismissed_notifications";

export function NotificationBell() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<NotificationPayload | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useDismissibleLayer({
    isOpen,
    containerRef,
    onDismiss: () => setIsOpen(false),
  });

  useEffect(() => {
    if (!session?.backendAccessToken) {
      setData(null);
      return;
    }

    let active = true;

    const loadNotifications = async () => {
      try {
        const response = await fetch(`${backendUrl}/solicitacoes/notificacoes`, {
          headers: {
            Authorization: `Bearer ${session.backendAccessToken}`,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as NotificationPayload;
        const dismissed = readDismissedNotifications();
        const visibleTravelerNotifications = payload.travelerNotifications.filter(
          (item) => !dismissed.includes(item.id),
        );

        if (active) {
          setData({
            ...payload,
            travelerNotifications: visibleTravelerNotifications,
            totalRespostas: visibleTravelerNotifications.length,
            total: payload.totalPendentes + visibleTravelerNotifications.length,
          });
        }
      } catch {}
    };

    void loadNotifications();
    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, 20000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [session?.backendAccessToken]);

  if (!session?.user) {
    return null;
  }

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-label="Notificacoes"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className={styles.icon} aria-hidden="true">
          Avisos
        </span>
        {data?.total ? <span className={styles.badge}>{data.total}</span> : null}
      </button>

      {isOpen ? (
        <div className={styles.panel}>
          <div className={styles.header}>
            <strong>Notificacoes</strong>
            <span className={styles.counter}>
              {data?.totalPendentes ?? 0} pendentes
            </span>
          </div>

          {!data || data.total === 0 ? (
            <p className={styles.empty}>Nenhuma notificacao no momento.</p>
          ) : (
            <div className={styles.list}>
              {data.organizerNotifications.map((item) => (
                <Link
                  key={`organizer-${item.id}`}
                  href="/travel-package"
                  className={styles.item}
                  onClick={() => setIsOpen(false)}
                >
                  <strong>{item.user.name || item.user.email}</strong> solicitou entrar em{" "}
                  <span>{item.pacoteViagem.titulo}</span>
                </Link>
              ))}

              {data.travelerNotifications.map((item) => (
                <button
                  key={`traveler-${item.id}`}
                  type="button"
                  className={styles.itemButton}
                  onClick={() => {
                    dismissNotification(item.id);
                    setData((current) =>
                      current
                        ? {
                            ...current,
                            travelerNotifications: current.travelerNotifications.filter(
                              (notification) => notification.id !== item.id,
                            ),
                            totalRespostas: Math.max(0, current.totalRespostas - 1),
                            total: Math.max(0, current.total - 1),
                          }
                        : current,
                    );
                    setIsOpen(false);

                    if (item.statusSolicitacao === "ACEITA") {
                      router.push(`/my-trips/${item.pacoteViagem.id}`);
                    }
                  }}
                >
                  Sua solicitacao para <strong>{item.pacoteViagem.titulo}</strong> foi{" "}
                  {item.statusSolicitacao === "ACEITA" ? "aceita" : "rejeitada"}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function readDismissedNotifications() {
  if (typeof window === "undefined") {
    return [] as number[];
  }

  try {
    const raw = window.localStorage.getItem(DISMISSED_NOTIFICATIONS_KEY);
    if (!raw) {
      return [] as number[];
    }

    return JSON.parse(raw) as number[];
  } catch {
    return [] as number[];
  }
}

function dismissNotification(id: number) {
  if (typeof window === "undefined") {
    return;
  }

  const current = readDismissedNotifications();
  if (current.includes(id)) {
    return;
  }

  window.localStorage.setItem(
    DISMISSED_NOTIFICATIONS_KEY,
    JSON.stringify([...current, id]),
  );
}
