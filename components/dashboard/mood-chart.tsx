'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { MoodLog } from '@/types'
import { getLast30Days } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Props {
  moodLogs: MoodLog[]
}

export function MoodChart({ moodLogs: logs }: Props) {
  const days = getLast30Days()

  const data = days.map((date) => {
    const log = logs.find((l) => l.date === date)
    return {
      date: format(parseISO(date), 'M/d', { locale: ko }),
      score: log ? log.score : null,
    }
  })

  const avgScore = logs.length > 0
    ? Math.round((logs.reduce((s, l) => s + l.score, 0) / logs.length) * 10) / 10
    : null

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2 32.6% 20%)" />
        <XAxis dataKey="date" tick={{ fill: 'hsl(215 20.2% 55%)', fontSize: 9 }} interval={4} />
        <YAxis domain={[0, 10]} tick={{ fill: 'hsl(215 20.2% 55%)', fontSize: 10 }} />
        <Tooltip
          contentStyle={{ background: 'hsl(217.2 32.6% 11%)', border: '1px solid hsl(217.2 32.6% 20%)', borderRadius: 8, fontSize: 12 }}
          formatter={(value) => [`${value}점`, '기분']}
        />
        {avgScore && (
          <ReferenceLine y={avgScore} stroke="#a78bfa" strokeDasharray="4 4" label={{ value: `평균 ${avgScore}`, fill: '#a78bfa', fontSize: 10, position: 'right' }} />
        )}
        <Area
          type="monotone"
          dataKey="score"
          stroke="#a78bfa"
          strokeWidth={2}
          fill="url(#moodGradient)"
          dot={false}
          connectNulls={false}
          activeDot={{ r: 5, fill: '#a78bfa' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
