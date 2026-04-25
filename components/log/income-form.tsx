'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Income, IncomeCategory } from '@/types'
import { Banknote, BarChart2, Briefcase, Gift, Loader2, Package, Plus, Trash2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { formatKRW } from '@/lib/utils'

const CATEGORIES: { label: IncomeCategory; icon: LucideIcon }[] = [
  { label: '급여', icon: Briefcase },
  { label: '부업', icon: Banknote },
  { label: '용돈', icon: Gift },
  { label: '투자', icon: BarChart2 },
  { label: '기타', icon: Package },
]

interface Props {
  date: string
}

export function IncomeForm({ date }: Props) {
  const [category, setCategory] = useState<IncomeCategory>('급여')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [entries, setEntries] = useState<Income[]>([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function loadEntries() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .order('created_at')

    if (error) {
      setError('수입 내역을 불러오지 못했습니다.')
      return
    }

    setEntries((data as Income[]) ?? [])
  }

  useEffect(() => {
    void loadEntries()
  }, [date])

  async function handleSave() {
    const parsedAmount = Number(amount)

    if (!parsedAmount || parsedAmount <= 0) {
      setError('금액을 올바르게 입력해 주세요.')
      return
    }

    setLoading(true)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('로그인 정보가 만료되었습니다. 다시 로그인해 주세요.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('income').insert({
      user_id: user.id,
      date,
      category,
      amount: parsedAmount,
      memo: memo.trim() || null,
    })

    if (error) {
      setError('수입 저장에 실패했습니다.')
      setLoading(false)
      return
    }

    setAmount('')
    setMemo('')
    await loadEntries()
    setLoading(false)
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    setError(null)

    const { error } = await supabase.from('income').delete().eq('id', id)

    if (error) {
      setError('수입 삭제에 실패했습니다.')
      setDeleting(null)
      return
    }

    await loadEntries()
    setDeleting(null)
  }

  const total = entries.reduce((sum, entry) => sum + entry.amount, 0)

  return (
    <div className="space-y-5">
      {error ? <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p> : null}

      {entries.length ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">오늘 수입 내역</p>
            <p className="text-sm font-bold text-[#4ADE80]">{formatKRW(total)}</p>
          </div>

          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{entry.category} · {entry.amount.toLocaleString('ko-KR')}원</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{entry.memo || '메모 없음'}</p>
              </div>
              <button
                onClick={() => void handleDelete(entry.id)}
                disabled={deleting === entry.id}
                className="text-[hsl(var(--muted-foreground))] hover:text-red-400 transition-colors p-1"
                aria-label="수입 삭제"
              >
                {deleting === entry.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">카테고리</p>
        <div className="grid grid-cols-5 gap-2">
          {CATEGORIES.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setCategory(label)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                category === label
                  ? 'border-[#4ADE80] bg-[#4ADE80]/10 text-[#4ADE80]'
                  : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[#4ADE80]/50'
              }`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">금액</p>
        <Input
          type="number"
          placeholder="0"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="text-xl font-bold bg-[hsl(var(--card))] border-[hsl(var(--border))] h-12"
          inputMode="numeric"
        />
        <Input
          type="text"
          placeholder="메모 (선택)"
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          className="bg-[hsl(var(--card))] border-[hsl(var(--border))]"
        />
      </div>

      <Button onClick={() => void handleSave()} disabled={loading} className="w-full h-12 bg-[#4ADE80] hover:opacity-90 text-base font-semibold text-black">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
        수입 추가
      </Button>
    </div>
  )
}
