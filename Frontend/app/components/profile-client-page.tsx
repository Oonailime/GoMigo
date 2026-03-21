"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import styles from "../profile/profile.module.css";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001/api";

type ProfileData = {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phoneNumber: string;
  sobreMim?: string | null;
  personalidade?: string | null;
  experienciaViagem?: string | null;
  gostaDeFazer?: string | null;
  ratingMedia?: number | null;
  totalAvaliacoes?: number;
  avaliacoesRecebidas?: Array<{
    id: number;
    tipo: string;
    nota: number;
    comentario?: string | null;
    dataAvaliacao: string;
    autor: {
      id: number;
      name?: string | null;
      email: string;
    };
    pacoteViagem?: {
      id: number;
      titulo: string;
    } | null;
  }>;
};

export function ProfileClientPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!session?.backendAccessToken) {
      setError("Sua sessao nao possui token do backend.");
      setStatus("error");
      return;
    }

    let active = true;

    const loadProfile = async () => {
      setStatus("loading");
      setError(null);

      try {
        const response = await fetch(`${backendUrl}/auth/me`, {
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

          if (active) {
            setError(message ?? "Falha ao carregar o perfil.");
            setStatus("error");
          }
          return;
        }

        const data = (await response.json()) as ProfileData;

        if (active) {
          setProfile(data);
          setStatus("ready");
        }
      } catch {
        if (active) {
          setError("Falha de conexao ao carregar o perfil.");
          setStatus("error");
        }
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [session?.backendAccessToken]);

  if (status === "loading") {
    return <section className={styles.heroCard}>Carregando perfil...</section>;
  }

  if (status === "error" || !profile) {
    return <section className={styles.heroCard}>{error ?? "Falha ao carregar o perfil."}</section>;
  }

  const editHref =
    session?.backendUserStatus === "INCOMPLETE"
      ? "/complete-profile?mode=edit"
      : "/profile/edit";

  return (
    <>
      <section className={styles.heroCard}>
        <div className={styles.heroTop}>
          <div>
            <h2 className={styles.name}>{profile.name}</h2>
            <p className={styles.meta}>{profile.email}</p>
            <p className={styles.meta}>{formatPhone(profile.phoneNumber)}</p>
          </div>
          <Link href={editHref} className={styles.primaryLink}>
            Editar perfil
          </Link>
        </div>

        <div className={styles.basicGrid}>
          <article className={styles.infoBlock}>
            <span className={styles.infoLabel}>CPF</span>
            <strong className={styles.infoValue}>{formatCpf(profile.cpf)}</strong>
          </article>
          <article className={styles.infoBlock}>
            <span className={styles.infoLabel}>Telefone</span>
            <strong className={styles.infoValue}>{formatPhone(profile.phoneNumber)}</strong>
          </article>
        </div>
      </section>

      <section className={styles.grid}>
        <ProfileCard
          title="Sobre mim"
          value={profile.sobreMim}
          empty="Voce ainda nao contou um pouco sobre voce."
        />
        <ProfileCard
          title="Personalidade"
          value={profile.personalidade}
          empty="Descreva como voce costuma viajar e conviver em grupo."
        />
        <ProfileCard
          title="Experiencia de viagem"
          value={profile.experienciaViagem}
          empty="Conte suas experiencias anteriores e o tipo de viagem que ja fez."
        />
        <ProfileCard
          title="Gosta de fazer"
          value={profile.gostaDeFazer}
          empty="Liste atividades, passeios e ritmos de viagem de que voce gosta."
        />
        <article className={`${styles.card} ${styles.cardWide}`}>
          <h2 className={styles.cardTitle}>Avaliacoes recebidas</h2>
          <p className={styles.cardText}>
            Media publica: {formatRating(profile.ratingMedia, profile.totalAvaliacoes)}
          </p>
          <div className={styles.reviewList}>
            {profile.avaliacoesRecebidas?.length ? (
              profile.avaliacoesRecebidas.map((review) => (
                <div key={review.id} className={styles.reviewItem}>
                  <strong className={styles.infoValue}>
                    {review.autor.name?.trim() || review.autor.email}
                  </strong>
                  <span className={styles.cardText}>
                    Nota {review.nota} {review.pacoteViagem ? `em ${review.pacoteViagem.titulo}` : ""}
                  </span>
                  {review.comentario ? (
                    <p className={styles.cardText}>{review.comentario}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className={styles.cardText}>Voce ainda nao recebeu avaliacoes.</p>
            )}
          </div>
        </article>
      </section>
    </>
  );
}

function ProfileCard({
  title,
  value,
  empty,
}: {
  title: string;
  value?: string | null;
  empty: string;
}) {
  return (
    <article className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>
      <p className={styles.cardText}>{value?.trim() || empty}</p>
    </article>
  );
}

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) {
    return value;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return value;
}

function formatRating(value?: number | null, total?: number) {
  if (typeof value !== "number" || !total) {
    return "Sem avaliacoes";
  }

  return `${value.toFixed(1).replace(".", ",")} / 5 (${total})`;
}
