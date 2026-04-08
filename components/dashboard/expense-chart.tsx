'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Expense } from '@/types'
import { format, getDaysInMonth } from 'date-fns'

interface Props {
  expenses: Expense[]
}

// CLAUDE.md 색상 팔레트
const COLORS: Record<string, string> = {
  '식비': '#F87171',
  '교통': '#818CF8',
  '쇼핑': '#FB923C',
  '기타': '#94a3b8',
}

export function ExpenseChart({ expenses }: Props) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = getDaysInMonth(now)

  // 이번 달 날짜 배열 (5일 단위로 묶어 표시)
  const weeks: { label: string; days: string[] }[] = []
  let weekStart = 1
  while (weekStart <= daysInMonth) {
    const weekEnd = Math.min(weekStart + 6, daysInMonth)
    const days = Array.from({ length: weekEnd - weekStart + 1 }, (_, i) => {
      const d = new Date(year, month, weekStart + i)
      return format(d, 'yyyy-MM-dd')
    })
    weeks.push({ label: `${weekStart}일`, days })
    weekStart += 7
  }

  const data = weeks.map(({ label, days }) => {
    const row: Record<string, string | number> = { date: label }
    for (const cat of ['식비', '교통', '쇼핑', '기타']) {
      row[cat] = expenses
        .filter((e) => days.includes(e.date) && e.category === cat)
        .reduce((sum, e) => sum + e.amount, 0)
    }
    return row
  })

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2 32.6% 20%)" />
        <XAxis dataKey="date" tick={{ fill: 'hsl(215 20.2% 55%)', fontSize: 10 }} />
        <YAxis tick={{ fill: 'hsl(215 20.2% 55%)', fontSize: 10 }} tickFormatter={(v) => v >= 10000 ? `${v/10000}만` : v >= 1000 ? `${v/1000}k` : v} />
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
