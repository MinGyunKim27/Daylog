'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { CheckCircle2, Loader2 } from 'lucide-react'

const MOOD_EMOJIS = ['😫', '😞', '🙁', '😕', '😐', '🙂', '😊', '😁', '🤩', '🥳']

interface Props {
  date: string
}

export function MoodForm({ date }: Props) {
  const [score, setScore] = useState(5)
  const [note, setNote] = useState('')
  const [existingId, setExistingId] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    setInitializing(true)

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setInitializing(false)
        return
      }

      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle()

      if (error) {
        setError('기분 기록을 불러오지 못했습니다.')
        setInitializing(false)
        return
      }

      if (data) {
        setScore(data.score)
        setNote(data.note ?? '')
        setExistingId(data.id)
      } else {
        setScore(5)
        setNote('')
        setExistingId(null)
      }

      setInitializing(false)
    }

    void load()
  }, [date])

  async function handleSave() {
    setLoading(true)
    setSaved(false)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('로그인 정보가 만료되었습니다. 다시 로그인해 주세요.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('mood_logs').upsert(
      {
        ...(existingId ? { id: existingId } : {}),
        user_id: user.id,
        date,
        score,
        note: note.trim() || null,
      },
      { onConflict: 'user_id,date' }
    )

    if (error) {
      setError('기분 기록 저장에 실패했습니다.')
      setLoading(false)
      return
    }

    setSaved(true)
    setLoading(false)
  }

  if (initializing) {
    return <div className="h-44 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] animate-pulse" />
  }

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p> : null}
      {existingId ? <p className="text-xs text-[#FBBF24] bg-[#FBBF24]/10 rounded-lg px-3 py-2">기록이 있어서 수정 모드로 열었습니다.</p> : null}

      <div className="text-center bg-[hsl(var(--card))] rounded-2xl px-6 py-6 border border-[hsl(var(--border))]">
        <div className="text-6xl mb-2">{MOOD_EMOJIS[score - 1]}</div>
        <p className="text-4xl font-bold text-[#FBBF24]">{score}점</p>
      </div>

      <div>
        <Slider value={[score]} onValueChange={([value]) => setScore(value)} min={1} max={10} step={1} className="py-2" />
        <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))] mt-1">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>

      <div>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">메모 (선택)</p>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="오늘 기분에 영향을 준 일이 있다면 적어보세요"
          rows={3}
          className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2.5 text-sm resize-none"
        />
      </div>

      <Button onClick={() => void handleSave()} disabled={loading} className="w-full h-12 bg-[#FBBF24] hover:opacity-90 text-base font-semibold text-black">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
        {saved ? '저장 완료' : existingId ? '기분 수정' : '기분 저장'}
      </Button>
    </div>
  )
}
