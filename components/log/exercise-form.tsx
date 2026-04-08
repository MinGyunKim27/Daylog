'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { today } from '@/lib/utils'
import { CheckCircle2, Loader2 } from 'lucide-react'

const EXERCISE_TYPES = [
  { label: '달리기', emoji: '🏃' },
  { label: '걷기', emoji: '🚶' },
  { label: '헬스', emoji: '💪' },
  { label: '수영', emoji: '🏊' },
  { label: '자전거', emoji: '🚴' },
  { label: '요가', emoji: '🧘' },
  { label: '등산', emoji: '⛰️' },
  { label: '기타', emoji: '⚡' },
]

export function ExerciseForm() {
  const [type, setType] = useState('달리기')
  const [duration, setDuration] = useState(30)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('exercise_logs').insert({
      user_id: user.id,
      date: today(),
      type,
      duration_minutes: duration,
    })

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">운동 종류</p>
        <div className="grid grid-cols-4 gap-2">
          {EXERCISE_TYPES.map(({ label, emoji }) => (
            <button
              key={label}
              onClick={() => setType(label)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                type === label
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
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">운동 시간</p>
          <span className="text-2xl font-bold text-[hsl(var(--primary))]">{duration}분</span>
        </div>
        <Slider
          value={[duration]}
          onValueChange={([v]) => setDuration(v)}
          min={5}
          max={180}
          step={5}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))] mt-1">
          <span>5분</span>
          <span>1시간</span>
          <span>3시간</span>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={loading}
        className="w-full h-12 bg-[hsl(var(--primary))] hover:opacity-90 text-base font-semibold"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
        {saved ? '저장됨!' : '저장하기'}
      </Button>
    </div>
  )
}
