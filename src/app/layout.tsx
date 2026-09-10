import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  metadataBase: new URL("https://fisi-trainer.osnahub.de"),
  title: "FiSi-Rechentrainer – Binär-, Dezimal-, Hex- & Subnetz-Trainer",
  description:
    "Interaktiver Rechentrainer für Auszubildende und Umschüler zum Fachinformatiker für Systemintegration (FiSi). Dualsystem, Dezimalumrechnungen, Hexadezimalsystem, Stellenwertmethode und IPv4-Subnetting.",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "FiSi-Rechentrainer – Binär-, Dezimal-, Hex- & Subnetz-Trainer",
    description:
      "Interaktiver Rechentrainer für Auszubildende und Umschüler zum Fachinformatiker für Systemintegration (FiSi). Dualsystem, Dezimalumrechnungen, Hexadezimalsystem, Stellenwertmethode und IPv4-Subnetting.",
    url: "https://fisi-trainer.osnahub.de",
    siteName: "FiSi-Rechentrainer",
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FiSi-Rechentrainer – Binär-, Dezimal-, Hex- & Subnetz-Trainer",
    description:
      "Interaktiver Rechentrainer für Auszubildende und Umschüler zum Fachinformatiker für Systemintegration (FiSi). Dualsystem, Dezimalumrechnungen, Hexadezimalsystem, Stellenwertmethode und IPv4-Subnetting.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0f19" },
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" data-theme="dark" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
