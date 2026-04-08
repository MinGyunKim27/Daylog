export type ExpenseCategory =
  | '식비'
  | '교통'
  | '쇼핑'
  | '문화'
  | '주거'
  | '의료'
  | '구독'
  | '기타'

export interface Profile {
  id: string
  email: string | null
  sex: 'male' | 'female' | null
  birth_year: number | null
  height_cm: number | null
  weight_kg: number | null
  muscle_kg: number | null
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  date: string
  category: ExpenseCategory
  amount: number
  memo: string | null
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
  intensity: 'low' | 'medium' | 'high'
  duration_minutes: number
  calories_burned: number | null
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
  snacks: string[] | null
  calories: number | null
  photo_url: string | null
  created_at: string
}

export interface InsightItem {
  icon: string
  title: string
  text: string
  type: 'positive' | 'neutral' | 'tip'
}
