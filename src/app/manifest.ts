import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FiSi-Rechentrainer",
    short_name: "FiSiTrainer",
    description: "Interaktiver Dual-, Hex- und Subnetztrainer für Fachinformatiker (IHK)",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0f19",
    theme_color: "#0369a1",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
