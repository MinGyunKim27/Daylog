import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'

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
  const d = new Date()
  return format(new Date(d.getFullYear(), d.getMonth(), 1), 'yyyy-MM-dd')
}

export function calcSleepDuration(bedtime: string, wakeTime: string): number {
  const [bh, bm] = bedtime.split(':').map(Number)
  const [wh, wm] = wakeTime.split(':').map(Number)
  const bedMinutes = bh * 60 + bm
  let wakeMinutes = wh * 60 + wm
  if (wakeMinutes <= bedMinutes) wakeMinutes += 24 * 60
  return Math.round(((wakeMinutes - bedMinutes) / 60) * 100) / 100
}

export function getLast30Days(): string[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return format(d, 'yyyy-MM-dd')
  })
}

export function getLast90Days(): string[] {
  return Array.from({ length: 90 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (89 - i))
    return format(d, 'yyyy-MM-dd')
  })
}

export function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return format(d, 'yyyy-MM-dd')
  })
}

export function getLastYear(): string[] {
  return Array.from({ length: 365 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (364 - i))
    return format(d, 'yyyy-MM-dd')
  })
}
