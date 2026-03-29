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
  totalAvaliacoes: number;
  organizerNotifications: Array<{
    id: number;
    statusSolicitacao: string;
    motivoRecusa?: string | null;
    user: { name?: string | null; email: string };
    pacoteViagem: { id: number; titulo: string };
  }>;
  travelerNotifications: Array<{
    id: number;
    statusSolicitacao: string;
    motivoRecusa?: string | null;
    pacoteViagem: { id: number; titulo: string };
  }>;
  evaluationNotifications: Array<{
    id: number;
    tipo: string;
    nota: number;
    autor: { name?: string | null; email: string };
    pacoteViagem?: { id: number; titulo: string } | null;
  }>;
};

type NotificationId = string;

type NotificationViewData = NotificationPayload & {
  unreadTotal: number;
  readIds: NotificationId[];
};

const READ_NOTIFICATIONS_KEY = "gomigo_read_notifications";

export function NotificationBell() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<NotificationViewData | null>(null);
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
        const readIds = readReadNotifications();

        if (active) {
          setData({
            ...payload,
            readIds,
            unreadTotal: countUnreadNotifications(payload, readIds),
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
        {data?.unreadTotal ? <span className={styles.badge}>{data.unreadTotal}</span> : null}
      </button>

      {isOpen ? (
        <div className={styles.panel}>
          <div className={styles.header}>
            <strong>Notificacoes</strong>
            <span className={styles.counter}>
              {data?.unreadTotal ?? 0} nao lidas
            </span>
          </div>

          {!data || getNotificationCount(data) === 0 ? (
            <p className={styles.empty}>Nenhuma notificacao no momento.</p>
          ) : (
            <div className={styles.list}>
              {data.organizerNotifications.map((item) => {
                const notificationId = getOrganizerNotificationId(item.id);
                const isRead = data.readIds.includes(notificationId);
                const organizerMessage =
                  item.statusSolicitacao === "PENDENTE"
                    ? (
                        <>
                          <strong>{item.user.name || item.user.email}</strong> solicitou entrar em{" "}
                          <span>{item.pacoteViagem.titulo}</span>
                        </>
                      )
                    : item.statusSolicitacao === "ACEITA"
                      ? (
                          <>
                            Voce aceitou <strong>{item.user.name || item.user.email}</strong> em{" "}
                            <span>{item.pacoteViagem.titulo}</span>
                          </>
                        )
                      : (
                          <>
                            Voce rejeitou <strong>{item.user.name || item.user.email}</strong> em{" "}
                            <span>{item.pacoteViagem.titulo}</span>
                          </>
                        );

                return (
                  <Link
                    key={notificationId}
                    href="/travel-package"
                    className={getNotificationClassName(styles.item, styles.readItem, isRead)}
                    onClick={() => {
                      setData((current) =>
                        current ? markNotificationAsRead(current, notificationId) : current,
                      );
                      setIsOpen(false);
                    }}
                  >
                    {organizerMessage}
                  </Link>
                );
              })}

              {data.travelerNotifications.map((item) => {
                const notificationId = getTravelerNotificationId(item.id);
                const isRead = data.readIds.includes(notificationId);

                return (
                  <button
                    key={notificationId}
                    type="button"
                    className={getNotificationClassName(
                      styles.itemButton,
                      styles.readItem,
                      isRead,
                    )}
                    onClick={() => {
                      setData((current) =>
                        current ? markNotificationAsRead(current, notificationId) : current,
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
                );
              })}

              {data.evaluationNotifications.map((item) => {
                const notificationId = getEvaluationNotificationId(item.id);
                const isRead = data.readIds.includes(notificationId);

                return (
                  <button
                    key={notificationId}
                    type="button"
                    className={getNotificationClassName(
                      styles.itemButton,
                      styles.readItem,
                      isRead,
                    )}
                    onClick={() => {
                      setData((current) =>
                        current ? markNotificationAsRead(current, notificationId) : current,
                      );
                      setIsOpen(false);
                      router.push("/profile");
                    }}
                  >
                    <strong>{item.autor.name || item.autor.email}</strong> avaliou voce com nota{" "}
                    <strong>{item.nota}</strong>
                    {item.pacoteViagem ? (
                      <>
                        {" "}em <span>{item.pacoteViagem.titulo}</span>
                      </>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function getOrganizerNotificationId(id: number) {
  return `organizer:${id}`;
}

function getTravelerNotificationId(id: number) {
  return `traveler:${id}`;
}

function getEvaluationNotificationId(id: number) {
  return `evaluation:${id}`;
}

function getNotificationCount(data: NotificationPayload) {
  return (
    data.organizerNotifications.length +
    data.travelerNotifications.length +
    data.evaluationNotifications.length
  );
}

function countUnreadNotifications(data: NotificationPayload, readIds: NotificationId[]) {
  return (
    data.organizerNotifications.filter(
      (item) => !readIds.includes(getOrganizerNotificationId(item.id)),
    ).length +
    data.travelerNotifications.filter(
      (item) => !readIds.includes(getTravelerNotificationId(item.id)),
    ).length +
    data.evaluationNotifications.filter(
      (item) => !readIds.includes(getEvaluationNotificationId(item.id)),
    ).length
  );
}

function readReadNotifications() {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  try {
    const raw = window.localStorage.getItem(READ_NOTIFICATIONS_KEY);
    if (!raw) {
      return [] as string[];
    }

    return (JSON.parse(raw) as Array<string | number>).map((item) => String(item));
  } catch {
    return [] as string[];
  }
}

function writeReadNotifications(readIds: NotificationId[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(readIds));
}

function markNotificationAsRead(
  current: NotificationViewData,
  notificationId: NotificationId,
) {
  if (current.readIds.includes(notificationId)) {
    return current;
  }

  const nextReadIds = [...current.readIds, notificationId];
  writeReadNotifications(nextReadIds);

  return {
    ...current,
    readIds: nextReadIds,
    unreadTotal: countUnreadNotifications(current, nextReadIds),
  };
}

function getNotificationClassName(baseClassName: string, readClassName: string, isRead: boolean) {
  return isRead ? `${baseClassName} ${readClassName}` : baseClassName;
}
