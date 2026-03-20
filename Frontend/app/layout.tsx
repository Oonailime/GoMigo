import type { Metadata } from "next";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppSessionProvider } from "./components/session-provider";

const bodyFont = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "GoMigo",
  description: "Plataforma para organizar caronas, hospedagem e eventos turisticos.",
  icons: {
    icon: "/logo_GoMigo.png",
    shortcut: "/logo_GoMigo.png",
    apple: "/logo_GoMigo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeInitScript = `
    (function () {
      try {
        var storedTheme = window.localStorage.getItem('gomigo-theme');
        var theme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark';
        document.documentElement.dataset.theme = theme;
      } catch (error) {
        document.documentElement.dataset.theme = 'dark';
      }
    })();
  `;

  return (
    <html lang="pt-BR" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <AppSessionProvider>{children}</AppSessionProvider>
      </body>
    </html>
  );
}
