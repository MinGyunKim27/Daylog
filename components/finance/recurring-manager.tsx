'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Recurring } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatKRW } from '@/lib/utils'
import { Loader2, Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react'

const EXPENSE_CATEGORIES = ['식비', '교통', '쇼핑', '문화', '주거', '의료', '구독', '기타']
const INCOME_CATEGORIES = ['급여', '부업', '용돈', '투자', '기타']

export function RecurringManager() {
  const [items, setItems] = useState<Recurring[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // form state
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [dayOfMonth, setDayOfMonth] = useState('')
  const [category, setCategory] = useState('')

  const supabase = createClient()

  async function loadItems() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('recurring')
      .select('*')
      .eq('user_id', user.id)
      .order('type')
      .order('created_at')

    if (error) {
      setError('고정 항목을 불러오지 못했습니다.')
      return
    }

    setItems((data as Recurring[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    void loadItems()
  }, [])

  // category 초기화 (type 변경 시)
  useEffect(() => {
    setCategory(type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0])
  }, [type])

  async function handleSave() {
    if (!title.trim()) {
      setError('항목명을 입력해 주세요.')
      return
    }
    const parsedAmount = Number(amount)
    if (!parsedAmount || parsedAmount <= 0) {
      setError('금액을 올바르게 입력해 주세요.')
      return
    }

    setSaving(true)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('로그인 정보가 만료되었습니다.')
      setSaving(false)
      return
    }

    const { error } = await supabase.from('recurring').insert({
      user_id: user.id,
      type,
      title: title.trim(),
      amount: parsedAmount,
      day_of_month: dayOfMonth ? Number(dayOfMonth) : null,
      category: category || null,
    })

    if (error) {
      setError('저장에 실패했습니다.')
      setSaving(false)
      return
    }

    setTitle('')
    setAmount('')
    setDayOfMonth('')
    await loadItems()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    setDeleting(id)

    const { error } = await supabase.from('recurring').delete().eq('id', id)

    if (error) {
      setError('삭제에 실패했습니다.')
      setDeleting(null)
      return
    }

    await loadItems()
    setDeleting(null)
  }

  const incomeItems = items.filter((i) => i.type === 'income')
  const expenseItems = items.filter((i) => i.type === 'expense')
  const totalRecurringIncome = incomeItems.reduce((s, i) => s + i.amount, 0)
  const totalRecurringExpense = expenseItems.reduce((s, i) => s + i.amount, 0)

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p> : null}

      {/* 요약 */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#4ADE80]/30 bg-[#4ADE80]/8 p-4">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">월 고정 수입</p>
            <p className="text-xl font-black text-[#4ADE80] mt-1">{formatKRW(totalRecurringIncome)}</p>
          </div>
          <div className="rounded-2xl border border-[#F87171]/30 bg-[#F87171]/8 p-4">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">월 고정 지출</p>
            <p className="text-xl font-black text-[#F87171] mt-1">{formatKRW(totalRecurringExpense)}</p>
          </div>
        </div>
      )}

      {/* 목록 */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-[hsl(var(--card))] animate-pulse border border-[hsl(var(--border))]" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-4">
          {incomeItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#4ADE80] mb-2 flex items-center gap-1.5">
                <TrendingUp size={13} /> 고정 수입
              </p>
              <div className="space-y-2">
                {incomeItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-[hsl(var(--card))] border border-[#4ADE80]/20 rounded-xl px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {item.category && `${item.category} · `}{item.day_of_month ? `매월 ${item.day_of_month}일` : '날짜 미지정'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold text-[#4ADE80]">{formatKRW(item.amount)}</span>
                      <button
                        onClick={() => void handleDelete(item.id)}
                        disabled={deleting === item.id}
                        className="text-[hsl(var(--muted-foreground))] hover:text-red-400 transition-colors p-1"
                      >
                        {deleting === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expenseItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#F87171] mb-2 flex items-center gap-1.5">
                <TrendingDown size={13} /> 고정 지출
              </p>
              <div className="space-y-2">
                {expenseItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-[hsl(var(--card))] border border-[#F87171]/20 rounded-xl px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {item.category && `${item.category} · `}{item.day_of_month ? `매월 ${item.day_of_month}일` : '날짜 미지정'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold text-[#F87171]">{formatKRW(item.amount)}</span>
                      <button
                        onClick={() => void handleDelete(item.id)}
                        disabled={deleting === item.id}
                        className="text-[hsl(var(--muted-foreground))] hover:text-red-400 transition-colors p-1"
                      >
                        {deleting === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-4">등록된 고정 항목이 없습니다.</p>
      )}

      {/* 추가 폼 */}
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4">
        <p className="text-sm font-semibold">고정 항목 추가</p>

        {/* 타입 선택 */}
        <div className="grid grid-cols-2 gap-2">
          {(['expense', 'income'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                type === t
                  ? t === 'expense'
                    ? 'border-[#F87171] bg-[#F87171]/10 text-[#F87171]'
                    : 'border-[#4ADE80] bg-[#4ADE80]/10 text-[#4ADE80]'
                  : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'
              }`}
            >
              {t === 'expense' ? <TrendingDown size={15} /> : <TrendingUp size={15} />}
              {t === 'expense' ? '고정 지출' : '고정 수입'}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <Input
            type="text"
            placeholder="항목명 (예: 월세, 넷플릭스, 월급)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-[hsl(var(--background))] border-[hsl(var(--border))]"
          />
          <Input
            type="number"
            placeholder="금액"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="numeric"
            className="bg-[hsl(var(--background))] border-[hsl(var(--border))] h-11"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1.5">매월 몇 일?</p>
              <Input
                type="number"
                placeholder="예: 25"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                min={1}
                max={31}
                inputMode="numeric"
                className="bg-[hsl(var(--background))] border-[hsl(var(--border))]"
              />
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1.5">카테고리</p>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm"
              >
                {(type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <Button
          onClick={() => void handleSave()}
          disabled={saving}
          className={`w-full h-11 text-sm font-semibold ${type === 'expense' ? 'bg-[#F87171] text-white hover:opacity-90' : 'bg-[#4ADE80] text-black hover:opacity-90'}`}
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          추가하기
        </Button>
      </div>
    </div>
  )
}
