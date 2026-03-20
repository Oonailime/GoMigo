"use client";

import { useEffect, useState } from "react";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import styles from "./app-header-actions.module.css";

type ThemeMode = "dark" | "light";

export function AppHeaderActions() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
  }, [themeMode]);

  return (
    <div className={styles.actions}>
      <ThemeToggle currentTheme={themeMode} onThemeChange={setThemeMode} />
      <NotificationBell />
      <UserMenu />
    </div>
  );
}
