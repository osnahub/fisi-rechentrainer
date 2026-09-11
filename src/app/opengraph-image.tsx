import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0b0f19",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "sans-serif",
          padding: "60px",
          border: "4px solid #0284c7",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: 20,
          }}
        >
          FiSi-Rechentrainer
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#cbd5e1",
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          Der interaktive Zahlensystem- &amp; Subnetz-Trainer für die Fachinformatiker-Ausbildung
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 24,
            color: "#38bdf8",
            fontFamily: "monospace",
          }}
        >
          Dezimal · Binär · Hexadezimal · Subnetzmasken &amp; CIDR
        </div>
      </div>
    ),
    { ...size }
  );
}
