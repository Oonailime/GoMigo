"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useDismissibleLayer } from "./use-dismissible-layer";
import styles from "./user-menu.module.css";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useDismissibleLayer({
    isOpen,
    containerRef,
    onDismiss: () => setIsOpen(false),
  });

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
          onClick={() => signIn("google", { callbackUrl: "/travel-package" })}
        >
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((current) => !current)}
      >
        <div className={styles.userInfo}>
          <span className={styles.userName}>
            {session.user.name ?? session.user.email ?? "Usuario"}
          </span>
        </div>
      </button>

      {isOpen ? (
        <div className={styles.menu} role="menu">
          <Link
            href="/travel-package"
            className={styles.menuItem}
            onClick={() => setIsOpen(false)}
          >
            Pacotes geridos por mim
          </Link>
          <Link
            href="/my-trips"
            className={styles.menuItem}
            onClick={() => setIsOpen(false)}
          >
            Minhas viagens
          </Link>
          <Link
            href="/travel-package/new"
            className={styles.menuItem}
            onClick={() => setIsOpen(false)}
          >
            Novo pacote
          </Link>
          <Link
            href="/profile"
            className={styles.menuItem}
            onClick={() => setIsOpen(false)}
          >
            Meu perfil
          </Link>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sair
          </button>
        </div>
      ) : null}
    </div>
  );
}
