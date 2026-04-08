'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { today } from '@/lib/utils'
import { CheckCircle2, Loader2 } from 'lucide-react'

const MEALS = [
  { key: 'breakfast' as const, label: '아침', emoji: '🌅', placeholder: '아침으로 먹은 것' },
  { key: 'lunch' as const, label: '점심', emoji: '☀️', placeholder: '점심으로 먹은 것' },
  { key: 'dinner' as const, label: '저녁', emoji: '🌙', placeholder: '저녁으로 먹은 것' },
]

export function DietForm() {
  const [meals, setMeals] = useState({ breakfast: '', lunch: '', dinner: '' })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('diet_logs').upsert({
      user_id: user.id,
      date: today(),
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
      {MEALS.map(({ key, label, emoji, placeholder }) => (
        <div key={key}>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">{emoji} {label}</p>
          <input
            type="text"
            value={meals[key]}
            onChange={(e) => setMeals((prev) => ({ ...prev, [key]: e.target.value }))}
            placeholder={placeholder}
            className="w-full h-12 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--primary))] placeholder:text-[hsl(var(--muted-foreground))] text-sm"
          />
        </div>
      ))}

      <Button
        onClick={handleSave}
        disabled={loading}
        className="w-full h-12 mt-2 bg-[hsl(var(--primary))] hover:opacity-90 text-base font-semibold"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
        {saved ? '저장됨!' : '저장하기'}
      </Button>
    </div>
  )
}
