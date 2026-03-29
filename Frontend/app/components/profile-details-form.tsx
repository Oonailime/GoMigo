"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  fetchBackend,
  fetchBackendJson,
  readApiErrorMessage,
} from "../lib/backend";
import styles from "./profile-details-form.module.css";

type ProfileDetailsFormData = {
  sobreMim?: string | null;
  personalidade?: string | null;
  experienciaViagem?: string | null;
  gostaDeFazer?: string | null;
};

export function ProfileDetailsForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [form, setForm] = useState({
    sobreMim: "",
    personalidade: "",
    experienciaViagem: "",
    gostaDeFazer: "",
  });
  const [status, setStatus] = useState<"loading" | "ready" | "saving">("loading");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const backendAccessToken = session?.backendAccessToken;

    if (!backendAccessToken) {
      setError("Sua sessao nao possui token do backend.");
      setStatus("ready");
      return;
    }

    let active = true;

    const loadProfile = async () => {
      setStatus("loading");
      setError(null);

      try {
        const { response, data } = await fetchBackendJson<ProfileDetailsFormData>("/auth/me", {
          token: backendAccessToken,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error();
        }

        if (!active) {
          return;
        }

        setForm({
          sobreMim: data?.sobreMim ?? "",
          personalidade: data?.personalidade ?? "",
          experienciaViagem: data?.experienciaViagem ?? "",
          gostaDeFazer: data?.gostaDeFazer ?? "",
        });
        setStatus("ready");
      } catch {
        if (active) {
          setError("Nao foi possivel carregar os detalhes do perfil.");
          setStatus("ready");
        }
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [session?.backendAccessToken]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const backendAccessToken = session?.backendAccessToken;

    if (!backendAccessToken) {
      setError("Sua sessao nao possui token do backend.");
      return;
    }

    setStatus("saving");
    setError(null);
    setSuccess(null);

    try {
      const response = await fetchBackend("/auth/me", {
        method: "PATCH",
        token: backendAccessToken,
        headers: {
          "Content-Type": "application/json",
        },
        json: {
          sobreMim: form.sobreMim.trim() || undefined,
          personalidade: form.personalidade.trim() || undefined,
          experienciaViagem: form.experienciaViagem.trim() || undefined,
          gostaDeFazer: form.gostaDeFazer.trim() || undefined,
        },
      });

      if (!response.ok) {
        setError(await readApiErrorMessage(response, "Nao foi possivel salvar o perfil."));
        setStatus("ready");
        return;
      }

      setSuccess("Perfil atualizado com sucesso.");
      setStatus("ready");
      router.refresh();
    } catch {
      setError("Falha de conexao ao salvar o perfil.");
      setStatus("ready");
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Field
        label="Sobre mim"
        value={form.sobreMim}
        onChange={(value) => setForm((current) => ({ ...current, sobreMim: value }))}
        placeholder="Apresente quem voce e, seu jeito de viajar e o que espera do grupo."
      />
      <Field
        label="Personalidade"
        value={form.personalidade}
        onChange={(value) => setForm((current) => ({ ...current, personalidade: value }))}
        placeholder="Ex.: comunicativo, organizado, gosta de planejar com antecedencia."
      />
      <Field
        label="Experiencia de viagem"
        value={form.experienciaViagem}
        onChange={(value) =>
          setForm((current) => ({ ...current, experienciaViagem: value }))
        }
        placeholder="Conte viagens marcantes, estilos que ja fez e como costuma contribuir."
      />
      <Field
        label="Coisas que gosta de fazer"
        value={form.gostaDeFazer}
        onChange={(value) => setForm((current) => ({ ...current, gostaDeFazer: value }))}
        placeholder="Ex.: trilhas leves, gastronomia local, praia, museus, vida noturna."
      />

      {error ? <p className={styles.error}>{error}</p> : null}
      {success ? <p className={styles.success}>{success}</p> : null}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => router.push("/profile")}
        >
          Voltar
        </button>
        <button type="submit" className={styles.primaryButton} disabled={status !== "ready"}>
          {status === "saving" ? "Salvando..." : status === "loading" ? "Carregando..." : "Salvar perfil"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <textarea
        className={styles.textarea}
        rows={5}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
