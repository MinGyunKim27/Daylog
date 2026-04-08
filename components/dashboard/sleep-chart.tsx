'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { SleepLog } from '@/types'
import { getLast30Days } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Props {
  sleepLogs: SleepLog[]
}

export function SleepChart({ sleepLogs: logs }: Props) {
  const days = getLast30Days()

  const data = days.map((date) => {
    const log = logs.find((l) => l.date === date)
    return {
      date: format(parseISO(date), 'M/d', { locale: ko }),
      hours: log ? Number(log.duration_hours) : null,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2 32.6% 20%)" />
        <XAxis dataKey="date" tick={{ fill: 'hsl(215 20.2% 55%)', fontSize: 9 }} interval={4} />
        <YAxis domain={[0, 12]} tick={{ fill: 'hsl(215 20.2% 55%)', fontSize: 10 }} tickFormatter={(v) => `${v}h`} />
        <Tooltip
          contentStyle={{ background: 'hsl(217.2 32.6% 11%)', border: '1px solid hsl(217.2 32.6% 20%)', borderRadius: 8, fontSize: 12 }}
          formatter={(value) => [`${value}시간`, '수면']}
        />
        <ReferenceLine y={7} stroke="#60a5fa" strokeDasharray="4 4" label={{ value: '권장 7h', fill: '#60a5fa', fontSize: 10, position: 'right' }} />
        <Line
          type="monotone"
          dataKey="hours"
          stroke="#818cf8"
          strokeWidth={2}
          dot={false}
          connectNulls={false}
          activeDot={{ r: 5, fill: '#818cf8' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
