export interface SubnetEntry {
  cidr: string;
  prefixLen: number;
  maskOctet: number;
  binaryOctet: string;
  magicNumber: number;
  hostBits: number;
  totalHosts: number;
  usableHosts: number;
  notes: string;
}

export const SUBNET_TABLE: SubnetEntry[] = [
  {
    cidr: "/24",
    prefixLen: 24,
    maskOctet: 0,
    binaryOctet: "00000000",
    magicNumber: 256,
    hostBits: 8,
    totalHosts: 256,
    usableHosts: 254,
    notes: "Klassisches /24 Netz (Standard-C-Klasse)"
  },
  {
    cidr: "/25",
    prefixLen: 25,
    maskOctet: 128,
    binaryOctet: "10000000",
    magicNumber: 128,
    hostBits: 7,
    totalHosts: 128,
    usableHosts: 126,
    notes: "Teilt /24 in 2 Hälften"
  },
  {
    cidr: "/26",
    prefixLen: 26,
    maskOctet: 192,
    binaryOctet: "11000000",
    magicNumber: 64,
    hostBits: 6,
    totalHosts: 64,
    usableHosts: 62,
    notes: "4 Subnetze à 64 Adressen"
  },
  {
    cidr: "/27",
    prefixLen: 27,
    maskOctet: 224,
    binaryOctet: "11100000",
    magicNumber: 32,
    hostBits: 5,
    totalHosts: 32,
    usableHosts: 30,
    notes: "8 Subnetze à 32 Adressen"
  },
  {
    cidr: "/28",
    prefixLen: 28,
    maskOctet: 240,
    binaryOctet: "11110000",
    magicNumber: 16,
    hostBits: 4,
    totalHosts: 16,
    usableHosts: 14,
    notes: "Sehr häufig in IHK-Prüfungen!"
  },
  {
    cidr: "/29",
    prefixLen: 29,
    maskOctet: 248,
    binaryOctet: "11111000",
    magicNumber: 8,
    hostBits: 3,
    totalHosts: 8,
    usableHosts: 6,
    notes: "Kleine Transfernetze / DMZ"
  },
  {
    cidr: "/30",
    prefixLen: 30,
    maskOctet: 252,
    binaryOctet: "11111100",
    magicNumber: 4,
    hostBits: 2,
    totalHosts: 4,
    usableHosts: 2,
    notes: "Point-to-Point Router-Links"
  },
  {
    cidr: "/31",
    prefixLen: 31,
    maskOctet: 254,
    binaryOctet: "11111110",
    magicNumber: 2,
    hostBits: 1,
    totalHosts: 2,
    usableHosts: 2,
    notes: "RFC 3021 Punkt-zu-Punkt: 2 Hosts (ohne RFC: 0 nutzbar)"
  },
  {
    cidr: "/32",
    prefixLen: 32,
    maskOctet: 255,
    binaryOctet: "11111111",
    magicNumber: 1,
    hostBits: 0,
    totalHosts: 1,
    usableHosts: 1,
    notes: "Host-Route / Loopback: Exakt 1 Host"
  }
];

export const NIBBLE_TABLE = [
  { dec: 0, hex: "0", bin: "0000" },
  { dec: 1, hex: "1", bin: "0001" },
  { dec: 2, hex: "2", bin: "0010" },
  { dec: 3, hex: "3", bin: "0011" },
  { dec: 4, hex: "4", bin: "0100" },
  { dec: 5, hex: "5", bin: "0101" },
  { dec: 6, hex: "6", bin: "0110" },
  { dec: 7, hex: "7", bin: "0111" },
  { dec: 8, hex: "8", bin: "1000" },
  { dec: 9, hex: "9", bin: "1001" },
  { dec: 10, hex: "A", bin: "1010" },
  { dec: 11, hex: "B", bin: "1011" },
  { dec: 12, hex: "C", bin: "1100" },
  { dec: 13, hex: "D", bin: "1101" },
  { dec: 14, hex: "E", bin: "1110" },
  { dec: 15, hex: "F", bin: "1111" },
];

export const POWERS_OF_TWO_8BIT = [
  { power: 7, value: 128 },
  { power: 6, value: 64 },
  { power: 5, value: 32 },
  { power: 4, value: 16 },
  { power: 3, value: 8 },
  { power: 2, value: 4 },
  { power: 1, value: 2 },
  { power: 0, value: 1 }
];
