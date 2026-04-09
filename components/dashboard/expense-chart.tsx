'use client'

import { useMemo } from 'react'
import { Expense } from '@/types'

interface Props {
  expenses: Expense[]
}

const CATEGORIES = ['식비', '쇼핑', '교통', '문화', '주거', '의료', '구독', '기타'] as const

const COLORS: Record<(typeof CATEGORIES)[number], string> = {
  식비: '#F87171',
  쇼핑: '#FB923C',
  교통: '#8B95FF',
  문화: '#F6C453',
  주거: '#60A5FA',
  의료: '#34D399',
  구독: '#A78BFA',
  기타: '#64748B',
}

export function ExpenseChart({ expenses }: Props) {
  const data = useMemo(() => {
    const totals = CATEGORIES.map((category) => ({
      category,
      amount: expenses
        .filter((e) => e.category === category)
        .reduce((sum, e) => sum + e.amount, 0),
      color: COLORS[category],
    }))
    return totals.filter((d) => d.amount > 0).sort((a, b) => b.amount - a.amount)
  }, [expenses])

  if (!data.length) {
    return (
      <div className="flex h-[180px] items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">
        이번 달 지출 기록이 없어요
      </div>
    )
  }

  const max = data[0].amount

  return (
    <div className="flex flex-col justify-center min-h-[180px] space-y-2.5">
      {data.map(({ category, amount, color }) => (
        <div key={category} className="flex items-center gap-3">
          <span className="w-8 shrink-0 text-right text-xs text-[hsl(var(--muted-foreground))]">
            {category}
          </span>
          <div className="relative flex-1 overflow-hidden rounded-full bg-white/5 h-5">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(amount / max) * 100}%`, backgroundColor: color }}
            />
          </div>
          <span className="w-14 shrink-0 text-right text-xs font-medium tabular-nums">
            {amount >= 10000
              ? `${(amount / 10000).toFixed(amount % 10000 === 0 ? 0 : 1)}만`
              : `${amount.toLocaleString('ko-KR')}`}
          </span>
        </div>
      ))}
    </div>
  )
}
