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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('fisi_theme');var t=(s==='dark'||s==='light')?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
