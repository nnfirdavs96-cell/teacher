/** Клиент ИИ-помощника (Anthropic Messages API) + хранение ключа и настроек. */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_API = 'anthropic_api_key';
const KEY_MODEL = 'ai_model';

export const DEFAULT_MODEL = 'claude-sonnet-4-6';

export const AVAILABLE_MODELS = [
  { id: 'claude-sonnet-4-6', label: 'Sonnet 4.6 (баланс)' },
  { id: 'claude-opus-4-8', label: 'Opus 4.8 (умнее)' },
  { id: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5 (быстрее)' },
];

// SecureStore недоступен в вебе — там используем AsyncStorage.
async function setItem(key: string, value: string) {
  if (Platform.OS === 'web') return AsyncStorage.setItem(key, value);
  return SecureStore.setItemAsync(key, value);
}
async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return AsyncStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

export const saveApiKey = (k: string) => setItem(KEY_API, k);
export const loadApiKey = () => getItem(KEY_API);
export const saveModel = (m: string) => setItem(KEY_MODEL, m);
export const loadModel = async () => (await getItem(KEY_MODEL)) ?? DEFAULT_MODEL;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `Ты — опытный наставник для мастеров по установке и ремонту телевидения и домашних сетей.
Темы: спутниковое ТВ (DVB-S/S2), наземная система АНТ/MMDS (Ku-диапазон без спутника), эфирное ТВ (DVB-T2),
кабельное ТВ (DVB-C), оптика/GPON, Wi-Fi, локальные сети и СКС.

Правила ответов:
- Отвечай кратко, практично и по-русски, как мастер мастеру.
- Давай конкретные числа, нормы и пошаговые действия.
- Ключевые ориентиры: спутник/АНТ уровень −65…−35 dBm (цель −50), перегруз > −25; для 8PSK FEC 3/4 порог C/N 9.4 дБ, рабочий 11.4 дБ, Post-BER должен быть 0.
- Наводи по C/N (быстро реагирует), качество проверяй по MER и Post-BER. Высокий уровень при низком MER = перегруз.
- RG-6 затухание @2150 МГц ≈ 2.8 дБ/10 м. dBµV = dBm + 108.75.
- GPON Rx норма −8…−25 dBm. Wi-Fi 2.4 ГГц только каналы 1/6/11.
- Если данных мало — задай уточняющий вопрос. Не выдумывай частоты конкретных каналов — советуй сверять с оператором/lyngsat.`;

export async function askAssistant(
  apiKey: string,
  model: string,
  history: ChatMessage[]
): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      // нужно для прямых вызовов из браузера (веб-версия)
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const j = await res.json();
      detail = j?.error?.message ?? JSON.stringify(j);
    } catch {
      detail = await res.text();
    }
    throw new Error(`Ошибка API (${res.status}): ${detail}`);
  }

  const data = await res.json();
  const text = (data.content ?? [])
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('\n')
    .trim();
  return text || '(пустой ответ)';
}
