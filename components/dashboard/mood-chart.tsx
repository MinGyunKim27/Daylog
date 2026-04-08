'use client'

import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { MoodLog } from '@/types'
import { getLast30Days } from '@/lib/utils'

interface Props {
  moodLogs: MoodLog[]
}

export function MoodChart({ moodLogs: logs }: Props) {
  const days = getLast30Days()

  const data = days.map((date) => {
    const log = logs.find((item) => item.date === date)

    return {
      date: format(parseISO(date), 'M/d', { locale: ko }),
      score: log?.score ?? null,
    }
  })

  const avgScore = logs.length ? Math.round((logs.reduce((sum, log) => sum + log.score, 0) / logs.length) * 10) / 10 : null

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#FBBF24" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2 32.6% 20%)" />
        <XAxis dataKey="date" tick={{ fill: 'hsl(215 20.2% 55%)', fontSize: 9 }} interval={4} />
        <YAxis domain={[0, 10]} tick={{ fill: 'hsl(215 20.2% 55%)', fontSize: 10 }} />
        <Tooltip
          cursor={{ stroke: 'rgba(251, 191, 36, 0.35)', strokeWidth: 1 }}
          contentStyle={{ background: 'hsl(217.2 32.6% 11%)', border: '1px solid hsl(217.2 32.6% 20%)', borderRadius: 8, fontSize: 12 }}
          formatter={(value) => [`${value}점`, '기분']}
        />
        {avgScore ? <ReferenceLine y={avgScore} stroke="#FBBF24" strokeDasharray="4 4" label={{ value: `평균 ${avgScore}`, fill: '#FBBF24', fontSize: 10, position: 'right' }} /> : null}
        <Area type="monotone" dataKey="score" stroke="#FBBF24" strokeWidth={2} fill="url(#moodGradient)" dot={false} connectNulls={false} activeDot={{ r: 6, fill: '#FBBF24', strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
