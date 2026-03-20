"use client";

import { useThemeContext } from "./theme-provider";

export function useThemeMode() {
  return useThemeContext();
}
