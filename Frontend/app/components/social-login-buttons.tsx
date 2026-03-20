"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import styles from "./social-login-buttons.module.css";

export function SocialLoginButtons() {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <div className={styles.actions} aria-label="Acoes da conta">
        <Link href="/travel-package" className={styles.button}>
          Ir para meus pacotes
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.actions} aria-label="Entrar com redes sociais">
      <button
        type="button"
        className={styles.button}
        onClick={() => signIn("google", { callbackUrl: "/travel-package" })}
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
