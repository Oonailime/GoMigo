"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import styles from "./complete-profile-form.module.css";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001/api";

const digitsOnly = (value: string) => value.replace(/\D/g, "");

export function CompleteProfileForm() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [cpf, setCpf] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.backendAccessToken) {
      setError("Sua sessao expirou. Entre novamente com Google.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${backendUrl}/auth/complete-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.backendAccessToken}`,
        },
        body: JSON.stringify({
          name: name.trim() || undefined,
          cpf: digitsOnly(cpf),
          phoneNumber: digitsOnly(phoneNumber),
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { message?: string | string[] }
          | null;

        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;

        setError(message ?? "Nao foi possivel concluir o cadastro.");
        return;
      }

      const data = (await response.json()) as {
        accessToken: string;
        userStatus: "ACTIVE";
      };

      await update({
        backendAccessToken: data.accessToken,
        backendUserStatus: data.userStatus,
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

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sair
        </button>
        <button
          type="submit"
          className={styles.primaryButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Concluir cadastro"}
        </button>
      </div>
    </form>
  );
}
