'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { today } from '@/lib/utils'
import { ExpenseCategory } from '@/types'
import { CheckCircle2, Loader2 } from 'lucide-react'

const CATEGORIES: { label: string; value: ExpenseCategory; emoji: string }[] = [
  { label: '식비', value: '식비', emoji: '🍚' },
  { label: '교통', value: '교통', emoji: '🚌' },
  { label: '쇼핑', value: '쇼핑', emoji: '🛍️' },
  { label: '기타', value: '기타', emoji: '💳' },
]

export function ExpenseForm() {
  const [category, setCategory] = useState<ExpenseCategory>('식비')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('expenses').insert({
      user_id: user.id,
      date: today(),
      category,
      amount: Number(amount),
    })

    setAmount('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">카테고리</p>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map(({ label, value, emoji }) => (
            <button
              key={value}
              onClick={() => setCategory(value)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                category === value
                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]'
                  : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/0.5)]'
              }`}
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">금액 (원)</p>
        <div className="relative">
          <Input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-xl font-bold pr-8 bg-[hsl(var(--card))] border-[hsl(var(--border))] h-14"
            inputMode="numeric"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">원</span>
        </div>
        {amount && (
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
            {Number(amount).toLocaleString('ko-KR')}원
          </p>
        )}
      </div>

      <Button
        onClick={handleSave}
        disabled={!amount || loading}
        className="w-full h-12 bg-[hsl(var(--primary))] hover:opacity-90 text-base font-semibold"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
        {saved ? '저장됨!' : '저장하기'}
      </Button>
    </div>
  )
}
