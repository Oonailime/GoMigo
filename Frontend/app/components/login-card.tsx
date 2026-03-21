"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import styles from "./login-card.module.css";

export function LoginCard({ errorMessage }: { errorMessage?: string }) {
  const { data: session } = useSession();

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>Acesso rapido</span>
        <h1 className={styles.title}>Entre para oferecer sua viagem</h1>
        <p className={styles.subtitle}>
          Conecte com sua conta do Google para continuar.
        </p>
        {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}
      </div>

      {session?.backendAuthError === "BACKEND_AUTH_FAILED" ? (
        <button
          type="button"
          className={styles.googleButton}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sair e tentar novamente
        </button>
      ) : (
        <button
          type="button"
          className={styles.googleButton}
          onClick={() => signIn("google", { callbackUrl: "/travel-package/new" })}
        >
          <span className={styles.googleIcon} aria-hidden="true">
            G
          </span>
          Entrar com Google
        </button>
      )}
    </div>
  );
}
