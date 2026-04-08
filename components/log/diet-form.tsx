'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, Plus, X } from 'lucide-react'

const MEALS = [
  { key: 'breakfast' as const, label: '아침', emoji: '🌅', placeholder: '아침으로 먹은 것' },
  { key: 'lunch' as const, label: '점심', emoji: '☀️', placeholder: '점심으로 먹은 것' },
  { key: 'dinner' as const, label: '저녁', emoji: '🌙', placeholder: '저녁으로 먹은 것' },
]

interface Props { date: string }

export function DietForm({ date }: Props) {
  const [meals, setMeals] = useState({ breakfast: '', lunch: '', dinner: '' })
  const [snacks, setSnacks] = useState<string[]>([])
  const [snackInput, setSnackInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [existingId, setExistingId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('diet_logs').select('*').eq('user_id', user.id).eq('date', date).single()
      if (data) {
        setMeals({ breakfast: data.breakfast ?? '', lunch: data.lunch ?? '', dinner: data.dinner ?? '' })
        setSnacks(data.snacks ?? [])
        setExistingId(data.id)
      } else {
        setMeals({ breakfast: '', lunch: '', dinner: '' })
        setSnacks([])
        setExistingId(null)
      }
    }
    load()
  }, [date])

  const addSnack = () => {
    const trimmed = snackInput.trim()
    if (!trimmed) return
    setSnacks((prev) => [...prev, trimmed])
    setSnackInput('')
  }

  const removeSnack = (idx: number) => {
    setSnacks((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSave = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('diet_logs').upsert({
      ...(existingId ? { id: existingId } : {}),
      user_id: user.id, date,
      breakfast: meals.breakfast || null,
      lunch: meals.lunch || null,
      dinner: meals.dinner || null,
      snacks: snacks.length > 0 ? snacks : null,
    }, { onConflict: 'user_id,date' })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {existingId && (
        <p className="text-xs text-[#FB923C] bg-[#FB923C]/10 rounded-lg px-3 py-2">기록됨 — 수정 중</p>
      )}

      {/* 아침/점심/저녁 */}
      {MEALS.map(({ key, label, emoji, placeholder }) => (
        <div key={key}>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">{emoji} {label}</p>
          <input type="text" value={meals[key]}
            onChange={(e) => setMeals((prev) => ({ ...prev, [key]: e.target.value }))}
            placeholder={placeholder}
            className="w-full h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-[hsl(var(--foreground))] focus:outline-none focus:border-[#FB923C] placeholder:text-[hsl(var(--muted-foreground))] text-sm" />
        </div>
      ))}

      {/* 간식 — 여러 개 추가 */}
      <div>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">🍪 간식</p>

        {/* 기존 간식 목록 */}
        {snacks.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {snacks.map((snack, idx) => (
              <span key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FB923C]/15 border border-[#FB923C]/30 text-sm text-[hsl(var(--foreground))]">
                {snack}
                <button onClick={() => removeSnack(idx)}
                  className="text-[hsl(var(--muted-foreground))] hover:text-red-400 transition-colors">
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* 간식 입력 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={snackInput}
            onChange={(e) => setSnackInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSnack()}
            placeholder="간식 이름 입력 후 추가"
            className="flex-1 h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-[hsl(var(--foreground))] focus:outline-none focus:border-[#FB923C] placeholder:text-[hsl(var(--muted-foreground))] text-sm"
          />
          <button
            onClick={addSnack}
            disabled={!snackInput.trim()}
            className="h-11 px-4 rounded-xl border border-[#FB923C]/50 bg-[#FB923C]/10 text-[#FB923C] hover:bg-[#FB923C]/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <Button onClick={handleSave} disabled={loading}
        className="w-full h-12 mt-2 bg-[#FB923C] hover:opacity-90 text-base font-semibold text-white">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
        {saved ? '저장됨!' : existingId ? '수정하기' : '저장하기'}
      </Button>
    </div>
  )
}
