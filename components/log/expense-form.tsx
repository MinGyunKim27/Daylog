'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExpenseCategory, Expense } from '@/types'
import { Loader2, Trash2, Plus } from 'lucide-react'
import { formatKRW } from '@/lib/utils'

const CATEGORIES: { label: string; value: ExpenseCategory; emoji: string }[] = [
  { label: '식비', value: '식비', emoji: '🍚' },
  { label: '교통', value: '교통', emoji: '🚌' },
  { label: '쇼핑', value: '쇼핑', emoji: '🛍️' },
  { label: '기타', value: '기타', emoji: '💳' },
]

interface Props { date: string }

export function ExpenseForm({ date }: Props) {
  const [category, setCategory] = useState<ExpenseCategory>('식비')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [entries, setEntries] = useState<Expense[]>([])
  const supabase = createClient()

  const loadEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .order('created_at')
    setEntries((data as Expense[]) ?? [])
  }

  useEffect(() => { loadEntries() }, [date])

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('expenses').insert({
      user_id: user.id, date, category, amount: Number(amount),
    })
    setAmount('')
    await loadEntries()
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await supabase.from('expenses').delete().eq('id', id)
    await loadEntries()
    setDeleting(null)
  }

  const total = entries.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="space-y-5">
      {/* 기존 내역 */}
      {entries.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">이날 지출 내역</p>
            <p className="text-sm font-bold text-[#F87171]">{formatKRW(total)}</p>
          </div>
          {entries.map((e) => (
            <div key={e.id} className="flex items-center justify-between bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-[hsl(var(--muted))] px-2 py-0.5 rounded-md text-[hsl(var(--muted-foreground))]">{e.category}</span>
                <span className="font-semibold text-[hsl(var(--foreground))]">{e.amount.toLocaleString('ko-KR')}원</span>
              </div>
              <button
                onClick={() => handleDelete(e.id)}
                disabled={deleting === e.id}
                className="text-[hsl(var(--muted-foreground))] hover:text-red-400 transition-colors p-1"
              >
                {deleting === e.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 새로 추가 */}
      <div>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">카테고리</p>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map(({ label, value, emoji }) => (
            <button key={value} onClick={() => setCategory(value)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                category === value
                  ? 'border-[#F87171] bg-[#F87171]/10 text-[#F87171]'
                  : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[#F87171]/50'
              }`}>
              <span className="text-xl">{emoji}</span>
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">금액 (원)</p>
        <div className="relative">
          <Input type="number" placeholder="0" value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-xl font-bold pr-8 bg-[hsl(var(--card))] border-[hsl(var(--border))] h-14"
            inputMode="numeric"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">원</span>
        </div>
        {amount && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{Number(amount).toLocaleString('ko-KR')}원</p>}
      </div>

      <Button onClick={handleSave} disabled={!amount || loading}
        className="w-full h-12 bg-[#F87171] hover:opacity-90 text-base font-semibold text-white">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
        추가하기
      </Button>
    </div>
  )
}
