import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/app-shell'
import { RecurringManager } from '@/components/finance/recurring-manager'
import { Income, Expense } from '@/types'
import { formatKRW } from '@/lib/utils'
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'

function getKSTDate() {
  const now = new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
  return format(now, 'yyyy-MM-dd')
}

export default async function FinancePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const todayStr = getKSTDate()
  const monthStart = format(startOfMonth(new Date(todayStr)), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(new Date(todayStr)), 'yyyy-MM-dd')

  const [expenseResult, incomeResult] = await Promise.all([
    supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', monthStart)
      .lte('date', monthEnd)
      .order('date', { ascending: false }),
    supabase
      .from('income')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', monthStart)
      .lte('date', monthEnd)
      .order('date', { ascending: false }),
  ])

  const expenses = (expenseResult.data as Expense[]) ?? []
  const incomes = (incomeResult.data as Income[]) ?? []

  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0)
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0)
  const balance = totalIncome - totalExpense

  // 카테고리별 지출 집계
  const expenseByCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount
    return acc
  }, {})
  const expenseCategoryList = Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => b - a)

  // 카테고리별 수입 집계
  const incomeByCategory = incomes.reduce<Record<string, number>>((acc, i) => {
    acc[i.category] = (acc[i.category] ?? 0) + i.amount
    return acc
  }, {})
  const incomeCategoryList = Object.entries(incomeByCategory)
    .sort(([, a], [, b]) => b - a)

  const monthLabel = format(new Date(todayStr), 'M월')

  return (
    <AppShell>
      <div className="min-h-screen pb-24 md:pb-12 px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-5">

          {/* 이번 달 요약 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-[#4ADE80]/30 bg-[#4ADE80]/8 p-4">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{monthLabel} 수입</p>
              <p className="text-xl font-black text-[#4ADE80] mt-1 truncate">{formatKRW(totalIncome)}</p>
            </div>
            <div className="rounded-2xl border border-[#F87171]/30 bg-[#F87171]/8 p-4">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{monthLabel} 지출</p>
              <p className="text-xl font-black text-[#F87171] mt-1 truncate">{formatKRW(totalExpense)}</p>
            </div>
            <div
              className="rounded-2xl p-4"
              style={{
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: balance >= 0 ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)',
                background: balance >= 0 ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
              }}
            >
              <p className="text-xs text-[hsl(var(--muted-foreground))]">순수익</p>
              <p
                className="text-xl font-black mt-1 truncate"
                style={{ color: balance >= 0 ? '#4ADE80' : '#F87171' }}
              >
                {balance >= 0 ? '+' : ''}{formatKRW(balance)}
              </p>
            </div>
          </div>

          {/* 이번 달 카테고리 분석 */}
          {(expenseCategoryList.length > 0 || incomeCategoryList.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 지출 카테고리 */}
              {expenseCategoryList.length > 0 && (
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingDown size={15} className="text-[#F87171]" />
                    <h2 className="text-sm font-semibold">{monthLabel} 지출 카테고리</h2>
                  </div>
                  <div className="space-y-3">
                    {expenseCategoryList.map(([cat, amt]) => (
                      <div key={cat}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[hsl(var(--muted-foreground))]">{cat}</span>
                          <span className="font-semibold">{formatKRW(amt)}</span>
                        </div>
                        <div className="h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${(amt / totalExpense) * 100}%`, backgroundColor: '#F87171' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 수입 카테고리 */}
              {incomeCategoryList.length > 0 && (
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={15} className="text-[#4ADE80]" />
                    <h2 className="text-sm font-semibold">{monthLabel} 수입 카테고리</h2>
                  </div>
                  <div className="space-y-3">
                    {incomeCategoryList.map(([cat, amt]) => (
                      <div key={cat}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[hsl(var(--muted-foreground))]">{cat}</span>
                          <span className="font-semibold">{formatKRW(amt)}</span>
                        </div>
                        <div className="h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${(amt / totalIncome) * 100}%`, backgroundColor: '#4ADE80' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 고정 항목 관리 */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <div className="flex items-center gap-2 mb-5">
              <Wallet size={15} className="text-[hsl(var(--muted-foreground))]" />
              <h2 className="text-sm font-semibold">고정 수입 · 지출 관리</h2>
            </div>
            <RecurringManager />
          </div>

          {/* 이번 달 수입 기록 */}
          {incomes.length > 0 && (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-[#4ADE80]" />
                <h2 className="text-sm font-semibold">{monthLabel} 수입 기록</h2>
              </div>
              <div className="space-y-2">
                {incomes.map((income) => (
                  <div
                    key={income.id}
                    className="flex items-center justify-between rounded-xl px-4 py-3 border border-[#4ADE80]/20 bg-[#4ADE80]/5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{income.date} · {income.category}</p>
                      {income.memo && <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{income.memo}</p>}
                    </div>
                    <span className="shrink-0 text-sm font-bold text-[#4ADE80]">{formatKRW(income.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </AppShell>
  )
}
