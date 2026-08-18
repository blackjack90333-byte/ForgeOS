// src/types/index.ts

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export interface NofapLink {
  link: string;
  note: string;
}

// Финансовые типы
export interface MoneyCount {
  sum: number;
  divider: number;
}

export interface MoneyHistoryItem {
  sum: number;
  date: number;
}

export interface MoneyGoal {
  name: string;
  price: number;
}

// Обновленный документ Firestore
export interface UserDocument {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  nofap_timestamp?: number;
  nofap_links?: NofapLink[];
  money_count?: MoneyCount;
  money_history?: string; // сериализованный JSON массив MoneyHistoryItem[]
  money_goals?: string;   // сериализованный JSON массив MoneyGoal[]
}

export interface BodyMetric {
  id: string;
  date: string; // YYYY-MM-DD
  height: number; // Рост в см к этому замеру
  weight: number; // Вес в кг
  caliper?: number; // Складка в мм
  note?: string; // Заметка
  timestamp: number;
}

// Дополни поле в UserDocument:
// body_metrics?: BodyMetric[];