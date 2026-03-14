"use client";

import { signIn } from "next-auth/react";
import styles from "./social-login-buttons.module.css";

export function SocialLoginButtons() {
  return (
    <div className={styles.actions} aria-label="Entrar com redes sociais">
      <button
        type="button"
        className={styles.button}
        onClick={() => signIn("google", { callbackUrl: "/travel-package/new" })}
      >
        <span
          className={`${styles.icon} ${styles.google}`}
          aria-hidden="true"
        >
          G
        </span>
        Login com Google
      </button>
    </div>
  );
}
