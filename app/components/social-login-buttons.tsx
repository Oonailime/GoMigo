import styles from "./social-login-buttons.module.css";

export function SocialLoginButtons() {
  return (
    <div className={styles.actions} aria-label="Entrar com redes sociais">
      <button type="button" className={styles.button} disabled>
        <span
          className={`${styles.icon} ${styles.google}`}
          aria-hidden="true"
        >
          G
        </span>
        Login com Google em breve
      </button>
    </div>
  );
}
