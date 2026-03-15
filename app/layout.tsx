import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ApiKeyProvider } from "@/app/context/api-key-context";
import { ThemeProvider } from "@/app/context/theme-context";
import { ToastProvider } from "@/app/context/toast-context";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Enterprise GTM | OpenAI-Style War Room",
  description: "How I'd build pipeline and expansion for enterprise AI — built to feel like an OpenAI product.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'><path fill='%2310a37f' d='M12 2L14 8L20 9L15 12L16 18L12 15L8 18L9 12L4 9L10 8L12 2Z'/></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
    (() => {
      try {
        var s = localStorage.getItem("openai-gtm-theme");
        var theme = (s === "light" || s === "dark") ? s : "dark";
        document.documentElement.dataset.theme = theme;
        document.documentElement.classList.toggle("dark", theme === "dark");
        document.documentElement.classList.toggle("light", theme === "light");
      } catch {}
    })();
  `;

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <ApiKeyProvider>
            <ToastProvider>{children}</ToastProvider>
          </ApiKeyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
