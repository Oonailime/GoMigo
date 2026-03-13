import styles from "../page.module.css";

type ThemeMode = "dark" | "light";

type ThemeToggleProps = {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
};

export function ThemeToggle({
  currentTheme,
  onThemeChange,
}: ThemeToggleProps) {
  return (
    <div className={styles.themeToggle} aria-label="Selecionar tema">
      <button
        type="button"
        className={`${styles.themeToggleButton} ${
          currentTheme === "light" ? styles.themeToggleButtonActive : ""
        }`}
        onClick={() => onThemeChange("light")}
      >
        White mode
      </button>
      <button
        type="button"
        className={`${styles.themeToggleButton} ${
          currentTheme === "dark" ? styles.themeToggleButtonActive : ""
        }`}
        onClick={() => onThemeChange("dark")}
      >
        Dark mode
      </button>
    </div>
  );
}
