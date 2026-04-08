'use client'

import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { DietLog } from '@/types'
import { getDietTotalCalories, getLast7Days } from '@/lib/utils'

interface Props {
  dietLogs: DietLog[]
}

const MEAL_META = [
  { key: 'breakfast' as const, label: '아침', color: '#F59E0B' },
  { key: 'lunch' as const, label: '점심', color: '#FB923C' },
  { key: 'dinner' as const, label: '저녁', color: '#F97316' },
]

export function DietTimeline({ dietLogs }: Props) {
  const logsByDate = new Map(dietLogs.map((log) => [log.date, log]))
  const recentDays = getLast7Days().slice(-5).reverse()

  return (
    <div className="space-y-3">
      {recentDays.map((date) => {
        const log = logsByDate.get(date) ?? null
        const totalCalories = getDietTotalCalories(log)

        return (
          <div
            key={date}
            className="grid grid-cols-[72px_1fr] gap-3 rounded-2xl border p-3 transition-colors"
            style={{
              background: log
                ? 'linear-gradient(135deg, rgba(251,146,60,0.12), rgba(15,23,42,0.9))'
                : 'rgba(15,23,42,0.55)',
              borderColor: log ? 'rgba(251,146,60,0.25)' : 'rgba(148,163,184,0.18)',
            }}
          >
            <div className="flex flex-col items-start justify-between">
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {format(parseISO(date), 'EEE', { locale: ko })}
                </p>
                <p className="text-lg font-bold">{format(parseISO(date), 'd')}</p>
              </div>
              <span
                className="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold"
                style={{
                  backgroundColor: log ? 'rgba(251,146,60,0.16)' : 'rgba(100,116,139,0.16)',
                  color: log ? '#FDBA74' : '#94A3B8',
                }}
              >
                {log ? '기록됨' : '미기록'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold">
                    {log
                      ? [log.breakfast, log.lunch, log.dinner].filter(Boolean).join(' · ') || '메뉴 메모 없음'
                      : '기록이 없는 날'}
                  </p>
                  <p className="shrink-0 text-base font-bold text-[#FDBA74]">
                    {log ? `${totalCalories.toLocaleString('ko-KR')} kcal` : '-'}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {MEAL_META.map(({ key, label, color }) => {
                    const calories = log?.[`${key}_calories` as const] ?? 0

                    return (
                      <span
                        key={key}
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs"
                        style={{
                          borderColor: `${color}55`,
                          backgroundColor: `${color}16`,
                          color,
                        }}
                      >
                        <span>{label}</span>
                        <span className="font-semibold">{calories ? `${calories}kcal` : '-'}</span>
                      </span>
                    )
                  })}
                </div>
              </div>

              {log?.photo_url ? (
                <img
                  src={log.photo_url}
                  alt={`${format(parseISO(date), 'M월 d일', { locale: ko })} 식단 사진`}
                  className="h-16 w-16 shrink-0 rounded-xl border border-white/10 object-cover"
                />
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
