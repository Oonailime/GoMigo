"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import styles from "./user-menu.module.css";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className={styles.wrapper} aria-busy="true">
        <span className={styles.status}>Carregando...</span>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className={styles.wrapper}>
        <button
          type="button"
          className={styles.button}
          onClick={() => signIn("google", { callbackUrl: "/travel-package/new" })}
        >
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.userInfo}>
        <span className={styles.userName}>
          {session.user.name ?? session.user.email ?? "Usuario"}
        </span>
        <span className={styles.userMeta}>Conectado</span>
      </div>
      <button
        type="button"
        className={styles.buttonSecondary}
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Sair
      </button>
    </div>
  );
}
