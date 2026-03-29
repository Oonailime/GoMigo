"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeProvider = ThemeProvider;
exports.useThemeContext = useThemeContext;
const react_1 = require("react");
const THEME_STORAGE_KEY = "gomigo-theme";
const ThemeContext = (0, react_1.createContext)(null);
function ThemeProvider({ children }) {
    const [themeMode, setThemeMode] = (0, react_1.useState)("dark");
    (0, react_1.useEffect)(() => {
        const current = document.documentElement.dataset.theme;
        if (current === "light" || current === "dark") {
            setThemeMode(current);
            return;
        }
        const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme === "light" || storedTheme === "dark") {
            setThemeMode(storedTheme);
        }
    }, []);
    (0, react_1.useEffect)(() => {
        document.documentElement.dataset.theme = themeMode;
        window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    }, [themeMode]);
    const value = (0, react_1.useMemo)(() => ({
        themeMode,
        setThemeMode,
    }), [themeMode]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
function useThemeContext() {
    const context = (0, react_1.useContext)(ThemeContext);
    if (!context) {
        throw new Error("useThemeContext must be used within ThemeProvider");
    }
    return context;
}
