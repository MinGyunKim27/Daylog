'use client'

import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { format, getDaysInMonth } from 'date-fns'
import { Expense } from '@/types'

interface Props {
  expenses: Expense[]
}

const CATEGORY_ORDER = ['교통', '구독', '기타', '문화', '쇼핑', '식비', '의료', '주거'] as const

const COLORS: Record<(typeof CATEGORY_ORDER)[number], string> = {
  교통: '#8B95FF',
  구독: '#A78BFA',
  기타: '#64748B',
  문화: '#F6C453',
  쇼핑: '#FB923C',
  식비: '#F87171',
  의료: '#34D399',
  주거: '#60A5FA',
}

type ChartRow = {
  axisLabel: string
  tooltipLabel: string
  total: number
} & Record<(typeof CATEGORY_ORDER)[number], number>

function ExpenseTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string; payload: ChartRow }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  const total = payload.reduce((sum, item) => sum + Number(item.value ?? 0), 0)
  const visibleItems = payload.filter((item) => Number(item.value ?? 0) > 0).sort((a, b) => Number(b.value) - Number(a.value))

  return (
    <div className="min-w-[190px] rounded-2xl border border-white/10 bg-[#111827]/95 px-4 py-3 shadow-2xl backdrop-blur">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-white">총 {total.toLocaleString('ko-KR')}원</p>
      <div className="mt-3 space-y-1.5">
        {visibleItems.length ? (
          visibleItems.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-200">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </div>
              <span className="font-semibold text-white">{Number(item.value).toLocaleString('ko-KR')}원</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">해당 기간 지출이 없습니다.</p>
        )}
      </div>
    </div>
  )
}

export function ExpenseChart({ expenses }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = getDaysInMonth(now)

  const data = useMemo(() => {
    const ranges: { axisLabel: string; tooltipLabel: string; days: string[] }[] = []
    let weekStart = 1

    while (weekStart <= daysInMonth) {
      const weekEnd = Math.min(weekStart + 6, daysInMonth)
      const days = Array.from({ length: weekEnd - weekStart + 1 }, (_, index) =>
        format(new Date(year, month, weekStart + index), 'yyyy-MM-dd')
      )

      ranges.push({
        axisLabel: `${weekStart}-${weekEnd}일`,
        tooltipLabel: `${weekStart}일 ~ ${weekEnd}일`,
        days,
      })

      weekStart += 7
    }

    return ranges.map(({ axisLabel, tooltipLabel, days }) => {
      const row = {
        axisLabel,
        tooltipLabel,
        total: 0,
      } as ChartRow

      for (const category of CATEGORY_ORDER) {
        const amount = expenses
          .filter((expense) => days.includes(expense.date) && expense.category === category)
          .reduce((sum, expense) => sum + expense.amount, 0)

        row[category] = amount
        row.total += amount
      }

      return row
    })
  }, [daysInMonth, expenses, month, year])

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
        barCategoryGap="20%"
        onMouseMove={(state) => {
          if (typeof state?.activeTooltipIndex === 'number') {
            setActiveIndex(state.activeTooltipIndex)
          }
        }}
        onMouseLeave={() => setActiveIndex(null)}
      >
        <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.16)" />
        <XAxis
          dataKey="axisLabel"
          tick={{ fill: 'rgba(148, 163, 184, 0.88)', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: 'rgba(148, 163, 184, 0.18)' }}
        />
        <YAxis
          tick={{ fill: 'rgba(148, 163, 184, 0.88)', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            if (value >= 10000) return `${(value / 10000).toFixed(value % 10000 === 0 ? 0 : 1)}만`
            if (value >= 1000) return `${Math.round(value / 1000)}k`
            return String(value)
          }}
        />
        <Tooltip
          cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
          content={<ExpenseTooltip />}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.tooltipLabel ?? ''}
        />

        {CATEGORY_ORDER.map((category) => (
          <Bar key={category} dataKey={category} stackId="expense" radius={category === '주거' ? [6, 6, 0, 0] : undefined}>
            {data.map((_, index) => {
              const isActive = activeIndex === null || activeIndex === index

              return (
                <Cell
                  key={`${category}-${index}`}
                  fill={COLORS[category]}
                  fillOpacity={isActive ? 0.95 : 0.26}
                  stroke={activeIndex === index ? 'rgba(255,255,255,0.18)' : 'transparent'}
                  strokeWidth={activeIndex === index ? 1 : 0}
                />
              )
            })}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
