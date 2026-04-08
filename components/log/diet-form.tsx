'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2 } from 'lucide-react'

const MEALS = [
  { key: 'breakfast' as const, label: '아침', emoji: '🌅', placeholder: '아침으로 먹은 것' },
  { key: 'lunch' as const, label: '점심', emoji: '☀️', placeholder: '점심으로 먹은 것' },
  { key: 'dinner' as const, label: '저녁', emoji: '🌙', placeholder: '저녁으로 먹은 것' },
]

interface Props { date: string }

export function DietForm({ date }: Props) {
  const [meals, setMeals] = useState({ breakfast: '', lunch: '', dinner: '' })
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
        setExistingId(data.id)
      } else {
        setMeals({ breakfast: '', lunch: '', dinner: '' })
        setExistingId(null)
      }
    }
    load()
  }, [date])

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
      {MEALS.map(({ key, label, emoji, placeholder }) => (
        <div key={key}>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">{emoji} {label}</p>
          <input type="text" value={meals[key]}
            onChange={(e) => setMeals((prev) => ({ ...prev, [key]: e.target.value }))}
            placeholder={placeholder}
            className="w-full h-12 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-[hsl(var(--foreground))] focus:outline-none focus:border-[#FB923C] placeholder:text-[hsl(var(--muted-foreground))] text-sm" />
        </div>
      ))}
      <Button onClick={handleSave} disabled={loading}
        className="w-full h-12 mt-2 bg-[#FB923C] hover:opacity-90 text-base font-semibold text-white">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
        {saved ? '저장됨!' : existingId ? '수정하기' : '저장하기'}
      </Button>
    </div>
  )
}
