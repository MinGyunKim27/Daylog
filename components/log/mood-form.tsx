'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Loader2, CheckCircle2 } from 'lucide-react'

const MOOD_EMOJIS = ['😫', '😞', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩', '🥳']
const MOOD_LABELS = ['최악', '나쁨', '별로', '그냥', '보통', '괜찮음', '좋음', '좋아', '최고', '완벽']

interface Props { date: string }

export function MoodForm({ date }: Props) {
  const [score, setScore] = useState(5)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [existingId, setExistingId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('mood_logs').select('*').eq('user_id', user.id).eq('date', date).single()
      if (data) {
        setScore(data.score)
        setNote(data.note ?? '')
        setExistingId(data.id)
      } else {
        setScore(5)
        setNote('')
        setExistingId(null)
      }
    }
    load()
  }, [date])

  const handleSave = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('mood_logs').upsert({
      ...(existingId ? { id: existingId } : {}),
      user_id: user.id, date, score, note: note || null,
    }, { onConflict: 'user_id,date' })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setLoading(false)
  }

  const scoreColor = score >= 8 ? 'text-green-400' : score >= 6 ? 'text-blue-400' : score >= 4 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="space-y-6">
      <div className="text-center bg-[hsl(var(--card))] rounded-2xl px-6 py-6 border border-[hsl(var(--border))]">
        <div className="text-6xl mb-2 transition-all duration-200">{MOOD_EMOJIS[score - 1]}</div>
        <p className={`text-4xl font-bold ${scoreColor}`}>{score}</p>
        <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">{MOOD_LABELS[score - 1]}</p>
        {existingId && <p className="text-xs text-[#FBBF24] mt-1">기록됨 — 수정 중</p>}
      </div>

      <div>
        <Slider value={[score]} onValueChange={([v]) => setScore(v)} min={1} max={10} step={1} className="py-2" />
        <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))] mt-1">
          <span>1 (최악)</span><span>5 (보통)</span><span>10 (완벽)</span>
        </div>
      </div>

      <div>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">한줄 메모 (선택)</p>
        <textarea value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="오늘 기분이 이랬어요..." rows={2}
          className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2.5 text-[hsl(var(--foreground))] text-sm resize-none focus:outline-none focus:border-[#FBBF24] placeholder:text-[hsl(var(--muted-foreground))]" />
      </div>

      <Button onClick={handleSave} disabled={loading}
        className="w-full h-12 bg-[#FBBF24] hover:opacity-90 text-base font-semibold text-black">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
        {saved ? '저장됨!' : existingId ? '수정하기' : '저장하기'}
      </Button>
    </div>
  )
}
