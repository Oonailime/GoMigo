"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  fetchBackend,
  fetchBackendJson,
  readApiErrorMessage,
} from "../lib/backend";
import styles from "./complete-profile-form.module.css";

const digitsOnly = (value: string) => value.replace(/\D/g, "");

export function CompleteProfileForm({
  mode = "complete",
}: {
  mode?: "complete" | "edit";
}) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [cpf, setCpf] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(mode === "edit");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const backendAccessToken = session?.backendAccessToken;

    if (mode !== "edit" || !backendAccessToken) {
      setIsLoadingProfile(false);
      return;
    }

    let active = true;

    const loadProfile = async () => {
      setIsLoadingProfile(true);
      setError(null);

      try {
        const { response, data } = await fetchBackendJson<{
          name?: string | null;
          cpf?: string | null;
          phoneNumber?: string | null;
        }>("/auth/me", {
          token: backendAccessToken,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error();
        }

        if (!active) {
          return;
        }

        setName(data?.name ?? session.user?.name ?? "");
        setCpf(data?.cpf ?? "");
        setPhoneNumber(data?.phoneNumber ?? "");
      } catch {
        if (active) {
          setError("Nao foi possivel carregar seus dados atuais.");
        }
      } finally {
        if (active) {
          setIsLoadingProfile(false);
        }
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [mode, session?.backendAccessToken, session?.user?.name]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const backendAccessToken = session?.backendAccessToken;

    if (!backendAccessToken) {
      setError("Sua sessao expirou. Entre novamente com Google.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetchBackend(
        mode === "edit" ? "/auth/me" : "/auth/complete-profile",
        {
          method: mode === "edit" ? "PATCH" : "POST",
          token: backendAccessToken,
          headers: {
            "Content-Type": "application/json",
          },
          json: {
            name: name.trim() || undefined,
            cpf: digitsOnly(cpf),
            phoneNumber: digitsOnly(phoneNumber),
          },
        },
      );

      if (!response.ok) {
        setError(
          (await readApiErrorMessage(response, "")) ||
            (mode === "edit"
              ? "Nao foi possivel atualizar o perfil."
              : "Nao foi possivel concluir o cadastro."),
        );
        return;
      }

      if (mode === "edit") {
        const data = (await response.json()) as { name?: string | null };

        await update({
          user: {
            ...session.user,
            name: data.name ?? name,
          },
        });

        setSuccessMessage("Perfil atualizado com sucesso.");
        router.refresh();
        return;
      }

      const data = (await response.json()) as {
        accessToken: string;
        userStatus: "ACTIVE";
        user?: {
          id?: number;
          name?: string | null;
        };
      };

      await update({
        backendAccessToken: data.accessToken,
        backendUserStatus: data.userStatus,
        backendUserId: data.user?.id,
        user: {
          ...session.user,
          name: data.user?.name ?? name,
        },
      });

      router.push("/travel-package/new");
      router.refresh();
    } catch {
      setError("Falha de conexao com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {isLoadingProfile ? (
        <p className={styles.success}>Carregando dados do perfil...</p>
      ) : null}

      <label className={styles.field}>
        <span className={styles.label}>Nome completo</span>
        <input
          className={styles.input}
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex.: Maria Oliveira"
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>CPF</span>
        <input
          className={styles.input}
          type="text"
          inputMode="numeric"
          maxLength={14}
          value={cpf}
          onChange={(event) => setCpf(event.target.value)}
          placeholder="Somente numeros"
          required
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Telefone</span>
        <input
          className={styles.input}
          type="text"
          inputMode="tel"
          maxLength={15}
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
          placeholder="DDD + numero"
          required
        />
      </label>

      {error ? <p className={styles.error}>{error}</p> : null}
      {successMessage ? <p className={styles.success}>{successMessage}</p> : null}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() =>
            mode === "edit"
              ? router.push("/travel-package")
              : signOut({ callbackUrl: "/login" })
          }
        >
          {mode === "edit" ? "Voltar" : "Sair"}
        </button>
        <button
          type="submit"
          className={styles.primaryButton}
          disabled={isSubmitting || isLoadingProfile}
        >
          {isSubmitting
            ? "Salvando..."
            : mode === "edit"
              ? "Salvar perfil"
              : "Concluir cadastro"}
        </button>
      </div>
    </form>
  );
}
