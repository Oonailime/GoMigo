"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useThemeMode = useThemeMode;
const theme_provider_1 = require("./theme-provider");
function useThemeMode() {
    return (0, theme_provider_1.useThemeContext)();
}
