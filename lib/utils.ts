import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { addDays, format, parseISO, startOfMonth, subDays } from 'date-fns'
import { ko } from 'date-fns/locale'
import { DietLog } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatKRW(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'M월 d일 (EEE)', { locale: ko })
}

export function today(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getThisMonth(): string {
  return format(startOfMonth(new Date()), 'yyyy-MM-dd')
}

export function calcSleepDuration(bedtime: string, wakeTime: string): number {
  const [bh, bm] = bedtime.split(':').map(Number)
  const [wh, wm] = wakeTime.split(':').map(Number)
  const bedMinutes = bh * 60 + bm
  let wakeMinutes = wh * 60 + wm

  if (wakeMinutes <= bedMinutes) {
    wakeMinutes += 24 * 60
  }

  return Math.round(((wakeMinutes - bedMinutes) / 60) * 100) / 100
}

function getDays(count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = subDays(new Date(), count - i - 1)
    return format(d, 'yyyy-MM-dd')
  })
}

export function getLast7Days(): string[] {
  return getDays(7)
}

export function getLast30Days(): string[] {
  return getDays(30)
}

export function getLast90Days(): string[] {
  return getDays(90)
}

export function toInputDate(date: string): string {
  return format(parseISO(date), 'yyyy-MM-dd')
}

export function moveDate(date: string, diff: number): string {
  return format(addDays(parseISO(date), diff), 'yyyy-MM-dd')
}

export function getDietTotalCalories(dietLog: DietLog | null): number {
  if (!dietLog) return 0

  const breakfastCalories = dietLog.breakfast_calories ?? 0
  const lunchCalories = dietLog.lunch_calories ?? 0
  const dinnerCalories = dietLog.dinner_calories ?? 0

  if (breakfastCalories || lunchCalories || dinnerCalories) {
    return breakfastCalories + lunchCalories + dinnerCalories
  }

  return dietLog.calories ?? 0
}
