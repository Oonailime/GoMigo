"use client";

import type { ThemeMode } from "./theme-provider";
import styles from "./theme-toggle.module.css";

type ThemeToggleProps = {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
};

export function ThemeToggle({
  currentTheme,
  onThemeChange,
}: ThemeToggleProps) {
  return (
    <div className={styles.toggle} aria-label="Selecionar tema">
      <button
        type="button"
        className={`${styles.button} ${
          currentTheme === "light" ? styles.buttonActive : ""
        }`}
        onClick={() => onThemeChange("light")}
      >
        White mode
      </button>
      <button
        type="button"
        className={`${styles.button} ${
          currentTheme === "dark" ? styles.buttonActive : ""
        }`}
        onClick={() => onThemeChange("dark")}
      >
        Dark mode
      </button>
    </div>
  );
}
