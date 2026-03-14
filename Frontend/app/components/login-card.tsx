"use client";

import { signIn } from "next-auth/react";
import styles from "./login-card.module.css";

export function LoginCard() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>Acesso rapido</span>
        <h1 className={styles.title}>Entre para oferecer sua viagem</h1>
        <p className={styles.subtitle}>
          Conecte com sua conta do Google para continuar.
        </p>
      </div>

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
    </div>
  );
}
