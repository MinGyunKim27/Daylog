'use client'

import { ExerciseLog } from '@/types'
import { getLastYear } from '@/lib/utils'
import { format, parseISO, getDay } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Props {
  exerciseLogs: ExerciseLog[]
}

function getIntensity(minutes: number): string {
  if (minutes === 0) return 'bg-[hsl(217.2,32.6%,17%)]'
  if (minutes < 30) return 'bg-emerald-900'
  if (minutes < 60) return 'bg-emerald-700'
  if (minutes < 90) return 'bg-emerald-500'
  return 'bg-emerald-400'
}

export function ExerciseHeatmap({ exerciseLogs: logs }: Props) {
  const days = getLastYear()

  // Aggregate exercise minutes per day
  const minutesByDate: Record<string, number> = {}
  for (const log of logs) {
    minutesByDate[log.date] = (minutesByDate[log.date] ?? 0) + log.duration_minutes
  }

  // Build grid: weeks × days
  const firstDay = parseISO(days[0])
  const startPad = getDay(firstDay) // 0=Sun
  const paddedDays = [...Array(startPad).fill(null), ...days]
  const weeks: (string | null)[][] = []
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7))
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex gap-[3px] min-w-max">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((date, di) => {
              if (!date) {
                return <div key={di} className="w-3 h-3" />
              }
              const mins = minutesByDate[date] ?? 0
              return (
                <div
                  key={date}
                  title={`${format(parseISO(date), 'M/d', { locale: ko })} — ${mins}분`}
                  className={`w-3 h-3 rounded-[2px] heatmap-cell cursor-default ${getIntensity(mins)}`}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-[hsl(var(--muted-foreground))]">적음</span>
        {['bg-[hsl(217.2,32.6%,17%)]', 'bg-emerald-900', 'bg-emerald-700', 'bg-emerald-500', 'bg-emerald-400'].map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-[2px] ${c}`} />
        ))}
        <span className="text-xs text-[hsl(var(--muted-foreground))]">많음</span>
      </div>
    </div>
  )
}
