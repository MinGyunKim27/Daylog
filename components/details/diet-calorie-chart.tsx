'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { DietLog } from '@/types'

interface Props {
  dietLogs: DietLog[]
}

export function DietCalorieChart({ dietLogs }: Props) {
  const data = dietLogs
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
    .map((log) => ({
      date: format(parseISO(log.date), 'M/d', { locale: ko }),
      breakfast: log.breakfast_calories ?? 0,
      lunch: log.lunch_calories ?? 0,
      dinner: log.dinner_calories ?? 0,
      total: (log.breakfast_calories ?? 0) + (log.lunch_calories ?? 0) + (log.dinner_calories ?? 0),
    }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2 32.6% 20%)" />
        <XAxis dataKey="date" tick={{ fill: 'hsl(215 20.2% 55%)', fontSize: 10 }} />
        <YAxis tick={{ fill: 'hsl(215 20.2% 55%)', fontSize: 10 }} />
        <Tooltip
          contentStyle={{
            background: 'hsl(217.2 32.6% 11%)',
            border: '1px solid hsl(217.2 32.6% 20%)',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value, name) => [`${Number(value).toLocaleString('ko-KR')} kcal`, name as string]}
        />
        <Bar dataKey="breakfast" stackId="meal" fill="#F59E0B" radius={[0, 0, 0, 0]} />
        <Bar dataKey="lunch" stackId="meal" fill="#FB923C" radius={[0, 0, 0, 0]} />
        <Bar dataKey="dinner" stackId="meal" fill="#F97316" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
