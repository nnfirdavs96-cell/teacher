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

/** Профиль пользователя: ТВ-мастер или сети/сисадмин. */
export type Role = 'tv' | 'net';

export interface KbCategory {
  id: string;
  title: string;
  icon: string; // Ionicons name
  color: string;
  /** Для каких ролей показывать категорию. */
  roles: Role[];
  articles: KbArticle[];
}
