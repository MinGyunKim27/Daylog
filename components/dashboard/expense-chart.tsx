'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Expense } from '@/types'
import { getLast7Days } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Props {
  expenses: Expense[]
}

const COLORS: Record<string, string> = {
  '식비': '#a78bfa',
  '교통': '#60a5fa',
  '쇼핑': '#f472b6',
  '기타': '#94a3b8',
}

export function ExpenseChart({ expenses }: Props) {
  const days = getLast7Days()

  const data = days.map((date) => {
    const dayExpenses = expenses.filter((e) => e.date === date)
    const row: Record<string, string | number> = {
      date: format(parseISO(date), 'M/d (EEE)', { locale: ko }),
    }
    for (const cat of ['식비', '교통', '쇼핑', '기타']) {
      row[cat] = dayExpenses
        .filter((e) => e.category === cat)
        .reduce((sum, e) => sum + e.amount, 0)
    }
    return row
  })

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2 32.6% 20%)" />
        <XAxis dataKey="date" tick={{ fill: 'hsl(215 20.2% 55%)', fontSize: 10 }} />
        <YAxis tick={{ fill: 'hsl(215 20.2% 55%)', fontSize: 10 }} tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v} />
        <Tooltip
          contentStyle={{ background: 'hsl(217.2 32.6% 11%)', border: '1px solid hsl(217.2 32.6% 20%)', borderRadius: 8, fontSize: 12 }}
          formatter={(value, name) => [`${Number(value).toLocaleString('ko-KR')}원`, name as string]}
        />
        <Legend iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        {Object.entries(COLORS).map(([cat, color]) => (
          <Bar key={cat} dataKey={cat} stackId="a" fill={color} radius={cat === '기타' ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
