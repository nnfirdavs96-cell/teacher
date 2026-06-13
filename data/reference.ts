/**
 * Справочные таблицы: спутники с примерами транспондеров, частотные диапазоны,
 * сетки каналов DVB-T2 и Wi-Fi.
 *
 * ВАЖНО: частоты транспондеров меняются операторами. Перед настройкой
 * сверяйтесь с актуальными данными (например lyngsat.com). Здесь — типовые
 * ориентиры для региона.
 */

export interface Transponder {
  freq: number; // МГц
  pol: 'H' | 'V' | 'L' | 'R';
  sr: number; // символьная скорость, kS/s
  system: string; // DVB-S / DVB-S2
  note?: string;
}

export interface Satellite {
  id: string;
  name: string;
  position: string; // напр. "13°E"
  band: string;
  beam?: string;
  transponders: Transponder[];
}

export const satellites: Satellite[] = [
  {
    id: 'hotbird',
    name: 'Hot Bird 13B/13C/13E',
    position: '13°E',
    band: 'Ku',
    transponders: [
      { freq: 10719, pol: 'V', sr: 27500, system: 'DVB-S2' },
      { freq: 11034, pol: 'V', sr: 27500, system: 'DVB-S2' },
      { freq: 11541, pol: 'V', sr: 27500, system: 'DVB-S' },
      { freq: 12245, pol: 'H', sr: 27500, system: 'DVB-S2' },
    ],
  },
  {
    id: 'astra19',
    name: 'Astra 1KR/1L/1M/1N',
    position: '19.2°E',
    band: 'Ku',
    transponders: [
      { freq: 10743, pol: 'H', sr: 22000, system: 'DVB-S' },
      { freq: 11362, pol: 'H', sr: 22000, system: 'DVB-S2' },
      { freq: 12515, pol: 'H', sr: 22000, system: 'DVB-S2' },
    ],
  },
  {
    id: 'express36',
    name: 'Express AMU1 / Eutelsat 36',
    position: '36°E',
    band: 'Ku',
    beam: 'Россия / СНГ',
    transponders: [
      { freq: 11727, pol: 'V', sr: 27500, system: 'DVB-S2', note: 'Триколор-сегмент' },
      { freq: 12245, pol: 'L', sr: 27500, system: 'DVB-S2' },
      { freq: 12303, pol: 'L', sr: 27500, system: 'DVB-S2' },
    ],
  },
  {
    id: 'turksat42',
    name: 'Türksat 4A/5A',
    position: '42°E',
    band: 'Ku',
    transponders: [
      { freq: 11096, pol: 'V', sr: 30000, system: 'DVB-S2' },
      { freq: 12380, pol: 'V', sr: 27500, system: 'DVB-S2' },
    ],
  },
  {
    id: 'yamal402',
    name: 'Yamal 402',
    position: '54.9°E',
    band: 'Ku',
    beam: 'СНГ / Центральная Азия',
    transponders: [
      { freq: 10990, pol: 'V', sr: 27500, system: 'DVB-S2' },
      { freq: 11096, pol: 'V', sr: 27500, system: 'DVB-S2' },
    ],
  },
  {
    id: 'abs75',
    name: 'ABS-2/2A',
    position: '75°E',
    band: 'Ku',
    beam: 'Центральная Азия',
    transponders: [
      { freq: 11473, pol: 'V', sr: 22500, system: 'DVB-S2' },
      { freq: 12525, pol: 'H', sr: 45000, system: 'DVB-S2' },
    ],
  },
  {
    id: 'yamal90',
    name: 'Yamal 401',
    position: '90°E',
    band: 'Ku / C',
    beam: 'Россия',
    transponders: [
      { freq: 11635, pol: 'H', sr: 27500, system: 'DVB-S2' },
      { freq: 12560, pol: 'V', sr: 27500, system: 'DVB-S2' },
    ],
  },
];

export interface FreqBand {
  name: string;
  range: string;
  use: string;
}

export const freqBands: FreqBand[] = [
  { name: 'L-band (IF)', range: '950–2150 МГц', use: 'Выход LNB на кабель к ресиверу' },
  { name: 'C-band', range: '3.4–4.2 ГГц (приём)', use: 'Спутник, большие тарелки, дождестойкий' },
  { name: 'Ku-band', range: '10.7–12.75 ГГц', use: 'Спутник / АНТ, тарелки 0.6–1.2 м' },
  { name: 'Ka-band', range: '18–40 ГГц', use: 'Спутниковый интернет, малые антенны' },
  { name: 'UHF (ДМВ)', range: '470–790 МГц', use: 'Эфирное DVB-T2' },
  { name: 'VHF (МВ)', range: '174–230 МГц', use: 'Эфир (III диапазон)' },
];

export interface DvbtChannel {
  ch: number;
  freq: number;
}

/** УВЧ-каналы DVB-T2: f = 306 + 8×N (МГц). */
export const dvbt2Channels: DvbtChannel[] = Array.from({ length: 49 }, (_, i) => {
  const ch = i + 21; // каналы 21..69
  return { ch, freq: 306 + 8 * ch };
});

export interface WifiChannel {
  ch: number;
  freq: number;
  band: string;
  recommended?: boolean;
}

export const wifiChannels: WifiChannel[] = [
  { ch: 1, freq: 2412, band: '2.4 ГГц', recommended: true },
  { ch: 6, freq: 2437, band: '2.4 ГГц', recommended: true },
  { ch: 11, freq: 2462, band: '2.4 ГГц', recommended: true },
  { ch: 36, freq: 5180, band: '5 ГГц' },
  { ch: 40, freq: 5200, band: '5 ГГц' },
  { ch: 44, freq: 5220, band: '5 ГГц' },
  { ch: 48, freq: 5240, band: '5 ГГц' },
  { ch: 149, freq: 5745, band: '5 ГГц' },
  { ch: 153, freq: 5765, band: '5 ГГц' },
  { ch: 157, freq: 5785, band: '5 ГГц' },
  { ch: 161, freq: 5805, band: '5 ГГц' },
];
