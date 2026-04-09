import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/app-shell'
import { ExpenseChart } from '@/components/dashboard/expense-chart'
import { AiInsightPanel } from '@/components/ai/ai-insight-panel'
import { Expense } from '@/types'
import { formatDate, formatKRW, getThisMonth } from '@/lib/utils'

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  )
}

export default async function ExpensesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const expenseResult = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', getThisMonth())
    .order('date', { ascending: false })

  const expenses = (expenseResult.data as Expense[]) ?? []
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const averageAmount = expenses.length ? Math.round(totalAmount / expenses.length) : 0
  const topCategory = Object.entries(
    expenses.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])[0]

  return (
    <AppShell>
      <div className="min-h-screen pb-24 md:pb-12 px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard label="이번달 총 지출" value={formatKRW(totalAmount)} />
            <StatCard label="평균 지출" value={expenses.length ? formatKRW(averageAmount) : '기록 없음'} />
            <StatCard label="가장 큰 카테고리" value={topCategory ? `${topCategory[0]} · ${formatKRW(topCategory[1])}` : '기록 없음'} />
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="text-sm font-semibold mb-4">이번달 지출 흐름</h2>
            <ExpenseChart expenses={expenses} />
          </div>

          <AiInsightPanel type="expenses" data={expenses} accentColor="#F87171" />

          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">최근 지출 내역</h2>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{expenses.length}건</span>
            </div>
            <div className="space-y-3">
              {expenses.length ? (
                expenses.map((expense) => (
                  <div key={expense.id} className="flex items-start justify-between gap-3 border-b border-[hsl(var(--border))] pb-3 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-medium">{expense.category}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{formatDate(expense.date)}</p>
                      {expense.memo ? <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{expense.memo}</p> : null}
                    </div>
                    <p className="font-semibold whitespace-nowrap">{formatKRW(expense.amount)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">이번달 지출 기록이 아직 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
