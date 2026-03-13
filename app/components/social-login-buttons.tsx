import styles from "../page.module.css";

export function SocialLoginButtons() {
  return (
    <div className={styles.socialActions} aria-label="Entrar com redes sociais">
      <button type="button" className={styles.buttonSecondary} disabled>
        <span
          className={`${styles.socialIcon} ${styles.socialGoogle}`}
          aria-hidden="true"
        >
          G
        </span>
        Login com Google em breve
      </button>
    </div>
  );
}
