/**
 * Единая тёмная тема приложения. Тёмный фон удобен для работы на улице/крыше
 * (меньше слепит на ярком экране ночью и экономит батарею на OLED).
 */
export const colors = {
  bg: '#0b1220',
  bgCard: '#141d2e',
  bgCardAlt: '#1b2740',
  border: '#26344f',
  text: '#e8eef7',
  textDim: '#9fb0c8',
  textFaint: '#6b7c97',
  accent: '#3b82f6',
  accentDim: '#1e3a5f',

  // Сигнальные цвета для зон уровня/качества
  good: '#22c55e',
  warn: '#f59e0b',
  bad: '#ef4444',
  info: '#38bdf8',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const font = {
  h1: 24,
  h2: 20,
  h3: 17,
  body: 15,
  small: 13,
  tiny: 11,
} as const;
