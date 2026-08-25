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

export interface RelapseRecord {
  id: string;
  timestamp: number;
  durationFormatted: string;
  reason: string;              // Триггер
  substitute?: string;        // Чем заменишь (новое, опционально)
  reward?: string;            // Награда (новое, опционально)
  lesson: string;              // Вывод на будущее
}

// В UserDocument:
// export interface UserDocument {
//   // ... твои поля
//   nofap_relapses?: string; // JSON строка RelapseRecord[]
// }

// Обновленный документ Firestore
// export interface UserDocument {
//   displayName: string | null;
//   email: string | null;
//   photoURL: string | null;
//   nofap_timestamp?: number;
//   nofap_links?: NofapLink[];
//   money_count?: MoneyCount;
//   money_history?: string; // сериализованный JSON массив MoneyHistoryItem[]
//   money_goals?: string;   // сериализованный JSON массив MoneyGoal[]
// }
export interface UserDocument {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  nofap_timestamp?: number;
  nofap_links?: NofapLink[];
  money_count?: MoneyCount;
  money_history?: string; // сериализованный JSON массив MoneyHistoryItem[]
  money_goals?: string;   // сериализованный JSON массив MoneyGoal[]
  eisenhower_tasks?: string; // <--- ДОБАВЬ ЭТУ СТРОКУ
  nofap_relapses?: string; // JSON строка RelapseRecord[]
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

export type TaskQuadrant = "inbox" | "q1_urgent_important" | "q2_not_urgent_important" | "q3_urgent_not_important" | "q4_not_urgent_not_important";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface EisenhowerTask {
  id: string;
  title: string;
  quadrant: TaskQuadrant;
  status: TaskStatus;
  createdAt: number;
}

// Дополни поле в UserDocument:
// body_metrics?: BodyMetric[];