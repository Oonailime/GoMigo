"use client";

import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";
import { useThemeMode } from "./use-theme-mode";
import { UserMenu } from "./user-menu";
import styles from "./app-header-actions.module.css";

export function AppHeaderActions() {
  const { themeMode, setThemeMode } = useThemeMode();

  return (
    <div className={styles.actions}>
      <ThemeToggle currentTheme={themeMode} onThemeChange={setThemeMode} />
      <NotificationBell />
      <UserMenu />
    </div>
  );
}
