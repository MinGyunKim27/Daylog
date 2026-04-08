'use client'

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { SleepLog } from '@/types'
import { getLast30Days } from '@/lib/utils'

interface Props {
  sleepLogs: SleepLog[]
}

export function SleepChart({ sleepLogs: logs }: Props) {
  const days = getLast30Days()

  const data = days.map((date) => {
    const log = logs.find((item) => item.date === date)

    return {
      date: format(parseISO(date), 'M/d', { locale: ko }),
      hours: log ? Number(log.duration_hours) : null,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2 32.6% 20%)" />
        <XAxis dataKey="date" tick={{ fill: 'hsl(215 20.2% 55%)', fontSize: 9 }} interval={4} />
        <YAxis domain={[0, 12]} tick={{ fill: 'hsl(215 20.2% 55%)', fontSize: 10 }} tickFormatter={(value) => `${value}h`} />
        <Tooltip
          cursor={{ stroke: 'rgba(129, 140, 248, 0.35)', strokeWidth: 1 }}
          contentStyle={{ background: 'hsl(217.2 32.6% 11%)', border: '1px solid hsl(217.2 32.6% 20%)', borderRadius: 8, fontSize: 12 }}
          formatter={(value) => [`${value}시간`, '수면']}
        />
        <ReferenceLine y={7} stroke="#60A5FA" strokeDasharray="4 4" label={{ value: '권장 7h', fill: '#60A5FA', fontSize: 10, position: 'right' }} />
        <Line type="monotone" dataKey="hours" stroke="#818CF8" strokeWidth={2} dot={false} connectNulls={false} activeDot={{ r: 6, fill: '#818CF8', strokeWidth: 0 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
