# FiSi-Dec-Bin-Hex-Trainer – Binär-, Dezimal- & Hex-Übungshilfe

Ein interaktives Trainingswerkzeug für Umschüler und Auszubildende zum **Fachinformatiker für Systemintegration (FiSi)** zur sicheren Beherrschung des Dualsystems, des Hexadezimalsystems, von IPv4-Oktetten und IHK-Prüfungsaufgaben.

🔗 **Live-Version:** [https://osnahub.github.io/fisi-dec-bin-hex-trainer/](https://osnahub.github.io/fisi-dec-bin-hex-trainer/)

---

## 🎯 Didaktischer Zweck

In der IHK-Abschlussprüfung (Teil 1 & Teil 2) und im Berufsalltag eines Systemintegrators (IPv4-Subnetting, IPv6-Präfixe, MAC-Adressen, Bitmasken, Zugriffsrechte) müssen Zahlen zwischen Dezimal-, Binär- und Hexadezimalsystem **schnell, sicher und ohne Taschenrechner** umgerechnet werden können.

Dieses Tool trainiert gezielt:
1. **Das Stellenwertprinzip** von Basis 2 (\(2^7 \dots 2^0\)) und Basis 16 (\(16^1, 16^0\)).
2. **Die 4-Bit Nibble-Methode:** Die wichtigste Praxismethode im Netzwerkbereich zur direkten Kopplung von 4 Bits und einer Hex-Ziffer.
3. **Typische IPv4-Subnetzmasken:** Die 9 magischen Werte (`0, 128, 192, 224, 240, 248, 252, 254, 255`).

---

## ✨ Features & Module

### 1. Dezimal ➔ Binär
* **Interaktive Bit-Schalter:** 8 Bits mit Live-Zweierpotenz-Anzeige. Klick auf ein Bit schaltet es um und summiert in Echtzeit die aktuelle Summe.
* **Freie Texteingabe:** Modus für schnelles Tippen (Tastatur-optimiert mit Enter-Bestätigung).
* **Ausführlicher Lösungsweg:** Zeigt Schritt für Schritt die Stellenwertmethode.
* **Bereiche:** 4-Bit (0–15), 8-Bit (0–255, FiSi-Standard) und 16-Bit (0–65535).

### 2. Binär ➔ Dezimal
* Vorgegebenes Bitmuster mit Nibble-Trennzeichen (4er-Blöcke).
* **Didaktische Einblendung:** Auf Wunsch können die Stellenwerte über den gesetzten Bits eingeblendet werden.
* **Lösungsaufschlüsselung:** Zeigt die mathematische Addition aller gesetzten 1-Bits.

### 3. 0x HEX-Trainer (Hexadezimal & Nibbles)
* **Binär ➔ Hex (Nibble-Methode):** Zerlegung des Bytes in High- und Low-Nibble (4 Bits) mit visuellen Kärtchen.
* **Hex ➔ Binär (Expansion):** Umwandlung jeder Hex-Ziffer (`0–F`) in einen 4-Bit-Block.
* **Dezimal ⇄ Hexadezimal:** Direkte Umrechnung mit Division durch 16 oder Stellenwert-Addition.
* **Zuschaltbarer Nibble-Spickzettel:** Direkte Tabelle von `0000` (0) bis `1111` (F / 15).

### 4. FiSi-Spezial: Subnetzmasken & IPv4-Oktette
* Spezieller Trainer für die **9 prüfungsrelevanten Subnetz-Werte**: `0, 128, 192, 224, 240, 248, 252, 254, 255`.
* Drei Übungsmodi:
  * **CIDR ➔ Subnetzmaske:** z. B. Welcher Dezimalwert steht im 4. Oktett bei `/28`?
  * **Masken-Oktett ➔ Binär:** z. B. Was ist `240` binär (`11110000`)?
  * **Schrittweite (Magic Number):** `256 - Maske` zur schnellen Netzblock-Ermittlung.
* Integrierte Referenztabelle mit Host-Bits, Gesamtadressen und nutzbaren Hosts.

### 5. Schritt-für-Schritt Rechenhelfer (Erklär-Rechner)
* Eingabe einer beliebigen Zahl als **Dezimal**, **Binär** oder **Hexadezimal**.
* Parallele, tabellarische Aufschlüsselung von drei Wegen:
  1. **Stellenwertmethode (Zweierpotenzen):** Der schnellste Weg im Kopf und auf Papier.
  2. **Restwertmethode (Division durch 2 mit Rest):** Mit Verdeutlichung der Leserichtung von unten nach oben.
  3. **Hexadezimal & Nibbles:** Nibble-Zerlegung und Division durch 16 mit Resten (`10=A` bis `15=F`).

### 6. Prüfungs-Sprint (Speed Challenge)
* 10 gemischte Aufgaben unter Zeitmessung (Dezimal, Binär, Subnetting und Hex).
* Punktevergabe & Fehleranalyse am Ende: Zeigt genau, welche Aufgaben wiederholt werden sollten.

---

## 🛠️ Tech-Stack
* **Framework:** [Next.js 15](https://nextjs.org/) (App Router, React 19, TypeScript)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) mit dynamischem Dark- und Light-Theme
* **Audio:** Web Audio API (100% synthetisiert, keine externen Sound-Assets erforderlich)
* **Icons & Effekte:** Lucide React & Canvas-Confetti

---

## 🚀 Lokale Entwicklung & Build

1. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```
2. **Entwicklungsserver starten:**
   ```bash
   npm run dev
   ```
   Die App ist anschließend unter [http://localhost:3000](http://localhost:3000) erreichbar.

3. **Produktions-Build erstellen:**
   ```bash
   npm run build
   ```

---

## ☁️ Deployment auf Vercel

1. Repository auf GitHub pushen ([osnahub/fisi-dec-bin-hex-trainer](https://github.com/osnahub/fisi-dec-bin-hex-trainer)).
2. Bei [Vercel](https://vercel.com) einloggen und auf **Add New... ➔ Project** klicken.
3. Das Repository `osnahub/fisi-dec-bin-hex-trainer` auswählen und auf **Deploy** klicken.
4. Vercel erkennt das Next.js-Projekt automatisch und stellt es in wenigen Sekunden bereit!

---

## 🎨 Design & Barrierefreiheit

* **Dark & Light Mode:** Wechsel per Klick auf die Sonne/Mond-Schaltfläche (wird im Browser gespeichert).
* **Audio-Feedback:** Dezentes Ton-Feedback für Klicks, richtige und falsche Antworten (abschaltbar).
* **Responsiv:** Optimiert für Smartphones, Laptops und Beamer-Projektionen im Klassenraum.
* **Tastaturbedienung:** Schnelle Bestätigung über die <kbd>Enter</kbd>-Taste in allen Modulen.
