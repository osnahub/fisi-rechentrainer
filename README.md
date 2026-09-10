# FiSi-Rechentrainer – Der interaktive Zahlensystem- & Subnetz-Trainer

Ein modernes, barrierefreies und datenschutzfreundliches Trainingswerkzeug für Auszubildende und Umschüler zum **Fachinformatiker für Systemintegration (FiSi)** zur sicheren Beherrschung des Dual- und Hexadezimalsystems, von IPv4-Oktetten, Subnetting und IHK-Prüfungsaufgaben.

---

## 🎯 Didaktischer Zweck

In der IHK-Abschlussprüfung (Teil 1 & Teil 2) und im Berufsalltag eines Systemintegrators (IPv4-Subnetting, IPv6-Präfixe, MAC-Adressen, Bitmasken, Zugriffsrechte) müssen Zahlen zwischen Dezimal-, Binär- und Hexadezimalsystem **schnell, sicher und ohne Taschenrechner** umgerechnet werden können.

Dieses Tool trainiert gezielt:
1. **Das Stellenwertprinzip** von Basis 2 (\(2^7 \dots 2^0\)) und Basis 16 (\(16^1, 16^0\)).
2. **Die 4-Bit-Nibble-Methode:** Die wichtigste Praxismethode zur direkten Kopplung von 4 Bits und einer Hex-Ziffer.
3. **Typische IPv4-Subnetzmasken:** Die 9 prüfungsrelevanten Werte (`0, 128, 192, 224, 240, 248, 252, 254, 255`).
4. **Prüfungsrelevante RFC-Standards:** Standard-konformes Subnetting nach **RFC 3021** (Point-to-Point /31) und Host-Routen (/32).

---

## ✨ Module & Funktionsumfang

### 1. Dezimal ➔ Binär (8-Bit)
* **Dualer Eingabemodus:**
  * **Bits klicken:** Interaktive 8-Bit-Schalter mit Live-Zweierpotenz-Anzeige und Echtzeit-Summierung.
  * **Binär tippen:** Direkte Zifferneingabe über Tastatur mit automatischer Eingabebereinigung (0/1) und <kbd>Enter</kbd>-Prüfung.
* **Ausführlicher Lösungsweg:** Detaillierter Subtraktionsweg mit Zweierpotenzzerlegung per Klick auf „Lösungsweg“.
* **Zahlenbereich:** 1 Byte / 8 Bits (\(0 \dots 255\)), passend für einzelne IPv4-Oktette.

### 2. Binär ➔ Dezimal (8-Bit)
* Vorgegebenes 8-Bit-Muster, didaktisch in zwei 4er-Nibbles gegliedert.
* **Zuschaltbare Stellenwerte:** Zeigt auf Wunsch die Zweierpotenzen sowie MSB (\(2^7=128\)) und LSB (\(2^0=1\)) über den Bits.
* **Mathematische Polynomdarstellung:** Ausführliche Herleitung (\(\sum b_i \cdot 2^i\)) mit farblicher Hervorhebung aller aktiven 1-Bits.

### 3. Hexadezimal-Trainer (4 Richtungen)
* Übt die direkte Übersetzung über das 4-Bit-Nibble-Verfahren:
  * **Dezimal ➔ Hex**
  * **Hex ➔ Dezimal**
  * **Binär ➔ Hex**
  * **Hex ➔ Binär**
* Unterstützt automatische Umrechnung und Prüfung von 8-Bit-Werten (\(0 \dots 255\) bzw. `00` bis `FF`).

### 4. FiSi-Spezial: Subnetzmasken & IPv4-Oktette
* Spezieller Trainer für die 9 prüfungsrelevanten Subnetz-Werte: `0, 128, 192, 224, 240, 248, 252, 254, 255`.
* Drei Übungsmodi:
  * **CIDR ➔ Subnetzmaske:** z. B. Welcher Dezimalwert steht im relevanten Oktett bei `/28`? (Akzeptiert sowohl das 4. Oktett `240` als auch die Vollmaske `255.255.255.240`).
  * **Masken-Oktett ➔ Binär:** z. B. Was ist `240` binär (`11110000`)?
  * **Schrittweite (Magic Number):** `256 - Maske` zur schnellen Netzblock-Ermittlung.
* **RFC-konforme Referenztabelle:**
  * Enthält Präfixe von `/24` bis `/32`.
  * **RFC 3021:** Präfix `/31` besitzt **2 nutzbare Host-Adressen** (Point-to-Point-Verbindungen ohne Verschwendung von Netz- und Broadcast-Adresse).
  * **Host-Route:** Präfix `/32` besitzt **1 Adresse / 1 Host**.
  * Saubere Unterscheidung zwischen Gesamtadressen und nutzbaren Hosts.

### 5. Didaktischer Rechenhelfer (Erklär-Rechner)
* Beliebige Eingabe einer Zahl als **Dezimal** oder **Binär** im gesamten vorzeichenlosen 32-Bit-Bereich (\(0 \dots 4.294.967.295\) bzw. 1 bis 32 Bits).
* Drei didaktische Rechenwege nebeneinander, vollständig ohne innere Scrollbalken:
  1. **Weg 1: Stellenwertmethode (Subtraktionsverfahren):** Schnellster Weg im Kopf und auf Prüfungs-Schmierzetteln.
  2. **Weg 2: Zweierrest-Verfahren (Division durch 2 mit Rest):** Vollständig aufgelistet mit Resten und Leserichtung von unten nach oben.
  3. **Weg 3: Polynom- & Potenzzerlegung:** Zerlegung nach Nibbles und mathematischer Summenformel.

---

## ♿ Barrierefreiheit & UX (WCAG 2.2 AA)

* **Tastaturnavigation:**
  * **Skip-to-Content-Link:** Direktsprung zum Hauptinhalt mit <kbd>Tab</kbd> + <kbd>Enter</kbd>.
  * **WAI-ARIA Tableiste:** Umschalten der Module mit den Pfeiltasten (<kbd>←</kbd> / <kbd>→</kbd>), <kbd>Home</kbd> und <kbd>End</kbd> (Roving `tabIndex`).
  * **Intelligenter Enter-Workflow:** Eingabe tippen ➔ <kbd>Enter</kbd> zum Prüfen ➔ <kbd>Enter</kbd> lädt automatisch die nächste Aufgabe und fokussiert das Eingabefeld.
* **Farbkontraste:** Alle semantischen Text- und Bedienelement-Farben genügen der WCAG 2.2 AA Richtlinie mit einem Kontrastverhältnis von \(\ge 4{,}5:1\).
* **Theme-Verwaltung:** Dynamischer Dark- und Light-Mode über React 19 `useSyncExternalStore` (kein Layout-Shift oder FOUC).
* **Screenreader-Support:** Dynamische Rückmeldungen über ARIA Live-Regions (`role="status"` / `role="alert"`), semantische Tabellenüberschriften (`<caption>`, `<th scope="...">`) und `aria-pressed`-Zustände an Bits.
* **Motion & Touch:** Automatische Deaktivierung dekorativer Animationen bei `prefers-reduced-motion`, Touch-optimierte Trefferflächen und opt-in Haptik (`fisi_haptics`).

---

## 🔒 Datenschutz & Sicherheit

* **100 % Client-Side:** Alle Berechnungen, Zustände und Übungen laufen ausschließlich lokal im Browser des Nutzers.
* **Keine Telemetrie & kein Tracking:** Es werden weder Analysedaten noch Nutzeraktivitäten erhoben.
* **Keine Cookies & keine externen Fonts:** Schriften und Stylesheets werden lokal ausgeliefert (kein Google Fonts / externe CDNs).
* **Strenge Sicherheitsheader:** Auslieferung mit restriktiver Content Security Policy (CSP), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` und `frame-ancestors 'none'`.
* **PWA & Offline-First:** Ausgestattet mit einem Service Worker (`/sw.js`), Web-Manifest und dynamischen Vektor-Icons. Funktioniert vollständig offline im Flugmodus oder bei Netzwerkausfällen im Klassenraum.

---

## 🛠️ Tech-Stack

* **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19, TypeScript 5.8)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) mit semantischen Farb-Tokens
* **Icons:** [Lucide React](https://lucide.dev/)
* **Testing:** [Vitest](https://vitest.dev/) (Unit/State Tests), [Playwright](https://playwright.dev/) (E2E) und [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright) (Automatisierte WCAG 2.2 A11y Audits)

---

## 🚀 Entwicklung & Qualitätssicherung

### 1. Abhängigkeiten installieren
```bash
npm install
```

### 2. Entwicklungsserver starten
```bash
npm run dev
```
Die Anwendung ist unter [http://localhost:3000](http://localhost:3000) erreichbar.

### 3. Qualitätsprüfungen & Tests
```bash
# Gesamte Validierungspipeline auf einmal ausführen
npm run verify

# Oder einzelne Prüfungen:
npm run typecheck    # TypeScript Typenprüfung
npm run lint         # ESLint statische Code-Analyse
npm test             # Vitest Unit- und Zustandstests
npm run build        # Produktions-Build
npm run test:e2e     # Playwright E2E- und WCAG 2.2 Accessibility-Tests
```

### 4. Produktions-Build erstellen
```bash
npm run build
```

---

## ℹ️ Rechtlicher Hinweis

Dieses Projekt ist ein unabhängiges Open-Source-Lern- und Trainingswerkzeug und steht in keiner offiziellen Verbindung zur Industrie- und Handelskammer (IHK). Alle Aufgaben und didaktischen Erklärungen basieren auf frei zugänglichen Ausbildungsinhalten für IT-Berufe und offiziellen IETF RFC-Standards (u. a. RFC 3021, RFC 4632).

---

## ☁️ Deployment auf Vercel

1. Repository auf GitHub pushen ([osnahub/fisi-dec-bin-hex-trainer](https://github.com/osnahub/fisi-dec-bin-hex-trainer)).
2. Bei [Vercel](https://vercel.com) anmelden und das Repository importieren.
3. Vercel erkennt das Next.js-Projekt automatisch und stellt es als statische Applikation bereit.
