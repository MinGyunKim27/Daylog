'use client'

import { format, getDay, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ExerciseLog } from '@/types'
import { getLast90Days } from '@/lib/utils'

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
  const days = getLast90Days()
  const minutesByDate: Record<string, number> = {}

  for (const log of logs) {
    minutesByDate[log.date] = (minutesByDate[log.date] ?? 0) + log.duration_minutes
  }

  const firstDay = parseISO(days[0])
  const startPad = getDay(firstDay)
  const paddedDays = [...Array(startPad).fill(null), ...days]
  const weeks: (string | null)[][] = []

  for (let index = 0; index < paddedDays.length; index += 7) {
    weeks.push(paddedDays.slice(index, index + 7))
  }

  const totalDays = Object.keys(minutesByDate).length
  const totalMinutes = Object.values(minutesByDate).reduce((sum, value) => sum + value, 0)

  return (
    <div>
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-[3px] min-w-max">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((date, dayIndex) => {
                if (!date) {
                  return <div key={dayIndex} className="w-3.5 h-3.5" />
                }

                const minutes = minutesByDate[date] ?? 0

                return (
                  <div
                    key={date}
                    title={`${format(parseISO(date), 'M/d (EEE)', { locale: ko })} · ${minutes > 0 ? `${minutes}분` : '운동 없음'}`}
                    className={`w-3.5 h-3.5 rounded-[3px] heatmap-cell cursor-default ${getIntensity(minutes)}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[hsl(var(--muted-foreground))]">적음</span>
          {['bg-[hsl(217.2,32.6%,17%)]', 'bg-emerald-900', 'bg-emerald-700', 'bg-emerald-500', 'bg-emerald-400'].map((color, index) => (
            <div key={index} className={`w-3.5 h-3.5 rounded-[3px] ${color}`} />
          ))}
          <span className="text-xs text-[hsl(var(--muted-foreground))]">많음</span>
        </div>
        <span className="text-xs text-[hsl(var(--muted-foreground))]">
          최근 3개월 {totalDays}일 운동 · 총 {Math.round(totalMinutes / 60)}시간
        </span>
      </div>
    </div>
  )
}
