import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { FontSizeProvider } from "@/components/providers/font-size-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ALTAY",
  description: "Analiz Takip Yönetimi",
  icons: [
    {
      rel: "icon",
      url: "/favicon/favicon.svg",
      type: "image/svg+xml",
    },
    {
      rel: "icon",
      url: "/favicon/favicon.ico",
      sizes: "any",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "192x192",
      url: "/favicon/web-app-manifest-192x192.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "512x512",
      url: "/favicon/web-app-manifest-512x512.png",
    },
  ],
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={inter.variable} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <FontSizeProvider>
              <LocaleProvider>
                {children}
                <Toaster richColors position="top-right" />
              </LocaleProvider>
            </FontSizeProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
