export type ExpenseCategory = '식비' | '교통' | '쇼핑' | '기타'

export interface Expense {
  id: string
  user_id: string
  date: string
  category: ExpenseCategory
  amount: number
  created_at: string
}

export interface SleepLog {
  id: string
  user_id: string
  date: string
  bedtime: string
  wake_time: string
  duration_hours: number
  created_at: string
}

export interface ExerciseLog {
  id: string
  user_id: string
  date: string
  type: string
  duration_minutes: number
  created_at: string
}

export interface MoodLog {
  id: string
  user_id: string
  date: string
  score: number
  note: string | null
  created_at: string
}

export interface DietLog {
  id: string
  user_id: string
  date: string
  breakfast: string | null
  lunch: string | null
  dinner: string | null
  created_at: string
}

export interface DailySummary {
  date: string
  expense?: Expense[]
  sleep?: SleepLog
  exercise?: ExerciseLog[]
  mood?: MoodLog
  diet?: DietLog
}

export interface InsightItem {
  icon: string
  title: string
  text: string
  type: 'positive' | 'neutral' | 'tip'
}
