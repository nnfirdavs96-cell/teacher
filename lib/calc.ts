/** Чистые расчётные функции для калькуляторов. Без UI — легко проверять. */

// ───────────────────────── Затухание кабеля ─────────────────────────

export type CableType = 'RG-6' | 'RG-59' | 'RG-11' | 'RG-58';

/** Опорные точки затухания RG-6, дБ на метр, по частоте (из таблицы мастер-класса). */
const RG6_POINTS: { f: number; perM: number }[] = [
  { f: 950, perM: 0.13 },
  { f: 1500, perM: 0.20 },
  { f: 2150, perM: 0.28 },
];

/** Множитель затухания относительно RG-6. */
const CABLE_FACTOR: Record<CableType, number> = {
  'RG-6': 1.0,
  'RG-59': 1.5, // тоньше — затухает сильнее
  'RG-11': 0.6, // толще — затухает меньше
  'RG-58': 1.7, // 50 Ом, не для ТВ, для справки
};

/** Линейная интерполяция/экстраполяция затухания RG-6, дБ/м, на заданной частоте. */
function rg6PerMeter(freqMHz: number): number {
  const p = RG6_POINTS;
  if (freqMHz <= p[0].f) {
    // экстраполяция вниз по двум первым точкам
    const k = (p[1].perM - p[0].perM) / (p[1].f - p[0].f);
    return Math.max(0.02, p[0].perM + k * (freqMHz - p[0].f));
  }
  for (let i = 0; i < p.length - 1; i++) {
    if (freqMHz <= p[i + 1].f) {
      const k = (p[i + 1].perM - p[i].perM) / (p[i + 1].f - p[i].f);
      return p[i].perM + k * (freqMHz - p[i].f);
    }
  }
  // экстраполяция вверх
  const a = p[p.length - 2];
  const b = p[p.length - 1];
  const k = (b.perM - a.perM) / (b.f - a.f);
  return b.perM + k * (freqMHz - b.f);
}

/** Затухание кабеля, дБ. */
export function cableLoss(type: CableType, lengthM: number, freqMHz: number): number {
  return rg6PerMeter(freqMHz) * CABLE_FACTOR[type] * lengthM;
}

// ───────────────────────── Бюджет сигнала ─────────────────────────

export interface SignalBudgetInput {
  startLevel: number; // dBm на источнике (после LNB)
  cableType: CableType;
  lengthM: number;
  freqMHz: number;
  connectors: number; // количество F-разъёмов (по 0.5 дБ)
  splitterWayCount: 0 | 2 | 3 | 4 | 8; // 0 = без делителя
}

const SPLITTER_LOSS: Record<number, number> = {
  0: 0,
  2: 4,
  3: 6,
  4: 8,
  8: 12,
};

export interface SignalBudgetResult {
  cableDb: number;
  connectorDb: number;
  splitterDb: number;
  totalLossDb: number;
  endLevel: number;
  zone: 'good' | 'warn' | 'bad';
  zoneText: string;
}

/** Расчёт уровня на конце линии и зоны (нормы для спутника/АНТ, dBm). */
export function signalBudget(i: SignalBudgetInput): SignalBudgetResult {
  const cableDb = cableLoss(i.cableType, i.lengthM, i.freqMHz);
  const connectorDb = i.connectors * 0.5;
  const splitterDb = SPLITTER_LOSS[i.splitterWayCount] ?? 0;
  const totalLossDb = cableDb + connectorDb + splitterDb;
  const endLevel = i.startLevel - totalLossDb;

  let zone: SignalBudgetResult['zone'];
  let zoneText: string;
  if (endLevel > -25 || endLevel < -75) {
    zone = 'bad';
    zoneText = endLevel > -25 ? 'Перегруз (> −25 dBm)' : 'Слишком слабо (< −75 dBm)';
  } else if (endLevel < -65) {
    zone = 'warn';
    zoneText = 'На грани (−75…−65 dBm)';
  } else {
    zone = 'good';
    zoneText = 'Рабочая зона (−65…−35 dBm)';
  }
  return { cableDb, connectorDb, splitterDb, totalLossDb, endLevel, zone, zoneText };
}

// ───────────────────────── Конвертер единиц ─────────────────────────

/** dBm → dBµV на 75 Ом. */
export function dbmToDbuv(dbm: number): number {
  return dbm + 108.75;
}
/** dBµV → dBm на 75 Ом. */
export function dbuvToDbm(dbuv: number): number {
  return dbuv - 108.75;
}
/** dBm → мВт. */
export function dbmToMw(dbm: number): number {
  return Math.pow(10, dbm / 10);
}
/** мВт → dBm. */
export function mwToDbm(mw: number): number {
  return 10 * Math.log10(mw);
}

// ───────────────────────── Азимут / элевация на спутник ─────────────────────────

export interface LookAngles {
  azimuth: number; // градусы от севера
  elevation: number; // градусы над горизонтом
  skew: number; // поворот LNB (поляризация), градусы
  visible: boolean;
}

const RAD = Math.PI / 180;
const RATIO = 0.1512; // Re / (Re + h) для геостационара

/**
 * Углы наведения на геостационарный спутник.
 * @param lat широта точки установки, °N (юг отрицательный)
 * @param lon долгота точки, °E (запад отрицательный)
 * @param satLon долгота спутника, °E
 */
export function lookAngles(lat: number, lon: number, satLon: number): LookAngles {
  const G = (satLon - lon) * RAD;
  const L = lat * RAD;

  const cosG = Math.cos(G);
  const cosL = Math.cos(L);

  const elevation =
    Math.atan2(cosG * cosL - RATIO, Math.sqrt(1 - cosG * cosG * cosL * cosL)) / RAD;

  let azimuth = 180 - Math.atan2(Math.tan(G), Math.sin(L)) / RAD;
  azimuth = ((azimuth % 360) + 360) % 360;

  const skew = Math.atan2(Math.sin(G), Math.tan(L)) / RAD;

  return {
    azimuth,
    elevation,
    skew,
    visible: elevation > 0,
  };
}

// ───────────────────────── DVB-T2 частота канала ─────────────────────────

/** Центральная частота УВЧ-канала DVB-T2, МГц. */
export function dvbt2Freq(channel: number): number {
  return 306 + 8 * channel;
}

// ───────────────────────── L-band пересчёт LNB ─────────────────────────

/** IF (на кабель) из частоты транспондера и гетеродина LNB. */
export function transponderToIf(freqMHz: number): { lo: number; if: number } {
  // Universal LNB: <11700 → 9750, иначе 10600
  const lo = freqMHz < 11700 ? 9750 : 10600;
  return { lo, if: freqMHz - lo };
}

// ───────────────────────── Подсеть (IPv4 / CIDR) ─────────────────────────

export interface SubnetResult {
  valid: boolean;
  mask: string;
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  hosts: number;
}

function intToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

/** Расчёт параметров подсети по IP и префиксу CIDR (0–32). */
export function subnetInfo(ip: string, cidr: number): SubnetResult {
  const empty: SubnetResult = {
    valid: false,
    mask: '',
    network: '',
    broadcast: '',
    firstHost: '',
    lastHost: '',
    hosts: 0,
  };
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return empty;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return empty;
  if (!Number.isInteger(cidr) || cidr < 0 || cidr > 32) return empty;

  const ipInt = ((nums[0] << 24) | (nums[1] << 16) | (nums[2] << 8) | nums[3]) >>> 0;
  const maskInt = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  const network = (ipInt & maskInt) >>> 0;
  const broadcast = (network | (~maskInt >>> 0)) >>> 0;

  let hosts = 0;
  let firstHost = intToIp(network);
  let lastHost = intToIp(broadcast);
  if (cidr <= 30) {
    hosts = Math.pow(2, 32 - cidr) - 2;
    firstHost = intToIp(network + 1);
    lastHost = intToIp(broadcast - 1);
  } else if (cidr === 31) {
    hosts = 2; // точка-точка (RFC 3021)
    firstHost = intToIp(network);
    lastHost = intToIp(broadcast);
  } else {
    hosts = 1; // /32 — один адрес
  }

  return {
    valid: true,
    mask: intToIp(maskInt),
    network: intToIp(network),
    broadcast: intToIp(broadcast),
    firstHost,
    lastHost,
    hosts,
  };
}

// ───────────────────────── Объём архива видеонаблюдения ─────────────────────────

/** Объём записи, ГБ. 1 Мбит/с за час = 0.45 ГБ. */
export function cctvStorageGB(
  bitrateMbps: number,
  cameras: number,
  hoursPerDay: number,
  days: number
): number {
  return bitrateMbps * 0.45 * hoursPerDay * days * cameras;
}
