/** Общие типы данных для офлайн-базы знаний. */

export interface KbSection {
  heading: string;
  /** Абзацы текста. */
  body?: string[];
  /** Маркированный список. */
  bullets?: string[];
  /** Таблица: первая строка — заголовки. */
  table?: { headers: string[]; rows: string[][] };
  /** Важная выноска (жёлтый блок). */
  note?: string;
}

export interface KbArticle {
  id: string;
  title: string;
  /** Короткое описание для списка. */
  summary: string;
  /** Ключевые слова для поиска. */
  tags: string[];
  sections: KbSection[];
}

export interface KbCategory {
  id: string;
  title: string;
  icon: string; // Ionicons name
  color: string;
  articles: KbArticle[];
}
