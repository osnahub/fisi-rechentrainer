import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FiSi-Dec-Bin-Hex-Trainer – Binär-, Dezimal- & Hex-Übungshilfe",
  description: "Interaktives Trainingswerkzeug für Umschüler und Auszubildende zum Fachinformatiker für Systemintegration (FiSi) zur sicheren Beherrschung des Dualsystems, des Hexadezimalsystems und von IPv4-Oktetten.",
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
      </body>
    </html>
  );
}
