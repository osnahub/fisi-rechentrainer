# FiSi-Rechentrainer – Der interaktive Zahlensystem- & Subnetz-Trainer

Ein interaktives Trainingswerkzeug für Auszubildende und Umschüler zum **Fachinformatiker für Systemintegration (FiSi)** zur sicheren Beherrschung des Dualsystems, von IPv4-Oktetten, Subnetting und IHK-Prüfungsaufgaben.

---

## 🎯 Didaktischer Zweck

In der IHK-Abschlussprüfung (Teil 1 & Teil 2) und im Berufsalltag eines Systemintegrators (IPv4-Subnetting, IPv6-Präfixe, MAC-Adressen, Bitmasken, Zugriffsrechte) müssen Zahlen zwischen Dezimal-, Binär- und Hexadezimalsystem **schnell, sicher und ohne Taschenrechner** umgerechnet werden können.

Dieses Tool trainiert gezielt:
1. **Das Stellenwertprinzip** von Basis 2 (\(2^7 \dots 2^0\)) und Basis 16 (\(16^1, 16^0\)).
2. **Die 4-Bit Nibble-Methode:** Die wichtigste Praxismethode im Netzwerkbereich zur direkten Kopplung von 4 Bits und einer Hex-Ziffer.
3. **Typische IPv4-Subnetzmasken:** Die 9 magischen Werte (`0, 128, 192, 224, 240, 248, 252, 254, 255`).

---

## ✨ Features & Module

### 1. Dezimal ➔ Binär (8-Bit)
* **Interaktive Bit-Schalter:** 8 Bits mit Live-Zweierpotenz-Anzeige. Klick auf ein Bit schaltet es um und summiert in Echtzeit die aktuelle Summe.
* **Freie Tastatureingabe:** Modus für schnelles Tippen (Zifferneingabe, optimiert mit Enter-Bestätigung).
* **Ausführlicher Lösungsweg:** Zeigt Schritt für Schritt die Subtraktionsmethode anhand der Zweierpotenzen.
* **Fokusbereich:** 1 Byte / 8 Bits (\(0\) bis \(255\)), exakt passend für IPv4-Oktette.

### 2. Binär ➔ Dezimal (8-Bit)
* Vorgegebenes 8-Bit-Muster, didaktisch in zwei 4er-Nibbles gegliedert.
* **Zuschaltbare Stellenwerte:** Zeigt auf Wunsch die Zweierpotenzen sowie MSB (\(2^7=128\)) und LSB (\(2^0=1\)) über den Bits.
* **Mathematische Polynomdarstellung:** Ausführliche Herleitung (\(\sum b_i \cdot 2^i\)) mit Hervorhebung aller aktiven 1-Bits.

### 3. FiSi-Spezial: Subnetzmasken & IPv4-Oktette
* Spezieller Trainer für die **9 prüfungsrelevanten Subnetz-Werte**: `0, 128, 192, 224, 240, 248, 252, 254, 255`.
* Drei Übungsmodi:
  * **CIDR ➔ Subnetzmaske:** z. B. Welcher Dezimalwert steht im relevanten Oktett bei `/28`?
  * **Masken-Oktett ➔ Binär:** z. B. Was ist `240` binär (`11110000`)?
  * **Schrittweite (Magic Number):** `256 - Maske` zur schnellen Netzblock-Ermittlung.
* Integrierte Referenztabelle mit Host-Bits, Gesamtadressen und nutzbaren Hosts.

### 4. Didaktischer Rechenhelfer (Erklär-Rechner)
* Beliebige Eingabe einer Zahl als **Dezimal** oder **Binär**.
* Parallele, übersichtliche Aufschlüsselung über drei didaktische Wege – vollständig ohne innere Scrollbalken:
  1. **Weg 1: Stellenwertmethode (Subtraktionsverfahren):** Der schnellste Weg im Kopf und auf Prüfungs-Schmierzetteln.
  2. **Weg 2: Division durch 2 mit Rest (Zweierrest-Verfahren):** Vollständig aufgelistet mit Resten und Leserichtung von unten nach oben.
  3. **Weg 3: Polynom- & Potenzzerlegung:** Zerlegung nach Nibbles und mathematischer Formel (\(\sum b_i \cdot 2^i\)).

---

## 🛠️ Tech-Stack
* **Framework:** [Next.js 15](https://nextjs.org/) (App Router, React 19, TypeScript)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) mit dynamischem Dark- und Light-Theme
* **UX:** Mobil-optimiert (Mobile First), vollkommen lautlos ohne störende Töne, Touch-freundliche Eingaben
* **Icons:** Lucide React

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
* **Lautlos & Konzentriert:** Keine nervigen Töne oder Geräuscheffekte.
* **Responsiv:** Optimiert für Smartphones, Laptops und Beamer-Projektionen im Klassenraum.
* **Tastaturbedienung:** Schnelle Bestätigung über die <kbd>Enter</kbd>-Taste in allen Modulen.
