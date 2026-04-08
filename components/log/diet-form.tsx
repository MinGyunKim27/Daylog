'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { DietLog, Profile } from '@/types'
import { getRecommendedCalories } from '@/lib/health'
import { CheckCircle2, Loader2, UploadCloud, X } from 'lucide-react'

const MEALS = [
  { key: 'breakfast' as const, label: '아침', emoji: '🍳', placeholder: '아침 메뉴' },
  { key: 'lunch' as const, label: '점심', emoji: '🍱', placeholder: '점심 메뉴' },
  { key: 'dinner' as const, label: '저녁', emoji: '🍽️', placeholder: '저녁 메뉴' },
]

interface Props {
  date: string
}

export function DietForm({ date }: Props) {
  const [meals, setMeals] = useState({ breakfast: '', lunch: '', dinner: '' })
  const [snacks, setSnacks] = useState<string[]>([])
  const [snackInput, setSnackInput] = useState('')
  const [calories, setCalories] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [existingId, setExistingId] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [uploading, setUploading] = useState(false)
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

      const [dietResult, profileResult] = await Promise.all([
        supabase.from('diet_logs').select('*').eq('user_id', user.id).eq('date', date).maybeSingle(),
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      ])

      if (dietResult.error) {
        setError('식단 기록을 불러오지 못했습니다.')
      } else if (dietResult.data) {
        const data = dietResult.data as DietLog
        setMeals({ breakfast: data.breakfast ?? '', lunch: data.lunch ?? '', dinner: data.dinner ?? '' })
        setSnacks(data.snacks ?? [])
        setCalories(data.calories ? String(data.calories) : '')
        setPhotoUrl(data.photo_url ?? '')
        setExistingId(data.id)
      } else {
        setMeals({ breakfast: '', lunch: '', dinner: '' })
        setSnacks([])
        setCalories('')
        setPhotoUrl('')
        setExistingId(null)
      }

      if (!profileResult.error && profileResult.data) {
        setProfile(profileResult.data as Profile)
      }

      setInitializing(false)
    }

    void load()
  }, [date])

  const recommendedCalories = useMemo(() => getRecommendedCalories(profile), [profile])
  const calorieGap = useMemo(() => {
    if (!recommendedCalories || !calories) return null
    return recommendedCalories - Number(calories)
  }, [recommendedCalories, calories])

  async function handleImageUpload(file: File) {
    setUploading(true)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setUploading(false)
      setError('로그인 정보가 만료되었습니다. 다시 로그인해 주세요.')
      return
    }

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/${date}-${Date.now()}.${ext}`

    const { error } = await supabase.storage.from('meal-photos').upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    })

    if (error) {
      setError('사진 업로드에 실패했습니다. 버킷(meal-photos) 설정을 확인해 주세요.')
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('meal-photos').getPublicUrl(path)
    setPhotoUrl(data.publicUrl)
    setUploading(false)
  }

  function addSnack() {
    const trimmed = snackInput.trim()
    if (!trimmed) return
    setSnacks((prev) => [...prev, trimmed])
    setSnackInput('')
  }

  function removeSnack(index: number) {
    setSnacks((prev) => prev.filter((_, i) => i !== index))
  }

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

    const { error } = await supabase.from('diet_logs').upsert(
      {
        ...(existingId ? { id: existingId } : {}),
        user_id: user.id,
        date,
        breakfast: meals.breakfast || null,
        lunch: meals.lunch || null,
        dinner: meals.dinner || null,
        snacks: snacks.length ? snacks : null,
        calories: calories ? Number(calories) : null,
        photo_url: photoUrl || null,
      },
      { onConflict: 'user_id,date' }
    )

    if (error) {
      setError('식단 저장에 실패했습니다.')
      setLoading(false)
      return
    }

    setSaved(true)
    setLoading(false)
  }

  if (initializing) {
    return <div className="h-56 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] animate-pulse" />
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p> : null}
      {existingId ? <p className="text-xs text-[#FB923C] bg-[#FB923C]/10 rounded-lg px-3 py-2">기록이 있어서 수정 모드로 열었습니다.</p> : null}

      {recommendedCalories ? (
        <div className="rounded-xl border border-[#FB923C]/40 bg-[#FB923C]/10 px-4 py-3">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">하루 권장 섭취량</p>
          <p className="text-xl font-bold text-[#FB923C]">{recommendedCalories.toLocaleString('ko-KR')} kcal</p>
          {calorieGap !== null ? (
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
              {calorieGap >= 0 ? `${calorieGap.toLocaleString('ko-KR')} kcal 남음` : `${Math.abs(calorieGap).toLocaleString('ko-KR')} kcal 초과`}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-xs text-yellow-300 bg-yellow-500/10 rounded-lg px-3 py-2">설정에서 키/몸무게/활동량을 입력하면 권장 섭취량을 보여줄 수 있어요.</p>
      )}

      {MEALS.map(({ key, label, emoji, placeholder }) => (
        <div key={key}>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">{emoji} {label}</p>
          <input
            type="text"
            value={meals[key]}
            onChange={(event) => setMeals((prev) => ({ ...prev, [key]: event.target.value }))}
            placeholder={placeholder}
            className="w-full h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm"
          />
        </div>
      ))}

      <div>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">총 칼로리 (kcal)</p>
        <input
          type="number"
          value={calories}
          onChange={(event) => setCalories(event.target.value)}
          placeholder="예: 1850"
          className="w-full h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm"
        />
      </div>

      <div>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">간식</p>
        {snacks.length ? (
          <div className="flex flex-wrap gap-2 mb-2">
            {snacks.map((snack, index) => (
              <span key={`${snack}-${index}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FB923C]/15 border border-[#FB923C]/30 text-sm">
                {snack}
                <button onClick={() => removeSnack(index)} className="text-[hsl(var(--muted-foreground))] hover:text-red-400" aria-label="간식 삭제">
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex gap-2">
          <input
            type="text"
            value={snackInput}
            onChange={(event) => setSnackInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addSnack()
              }
            }}
            placeholder="간식 입력 후 Enter"
            className="flex-1 h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm"
          />
          <button
            onClick={addSnack}
            className="h-11 px-4 rounded-xl border border-[#FB923C]/50 bg-[#FB923C]/10 text-[#FB923C]"
            disabled={!snackInput.trim()}
          >
            추가
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">식단 사진</p>
        <label className="h-11 px-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] flex items-center justify-center gap-2 cursor-pointer text-sm">
          <UploadCloud size={16} />
          {uploading ? '업로드 중...' : '사진 업로드'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                void handleImageUpload(file)
              }
            }}
          />
        </label>

        {photoUrl ? (
          <div className="mt-3 space-y-2">
            <img src={photoUrl} alt="식단 사진" className="w-full rounded-xl border border-[hsl(var(--border))] object-cover max-h-56" />
            <input
              type="text"
              value={photoUrl}
              onChange={(event) => setPhotoUrl(event.target.value)}
              className="w-full h-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-xs"
            />
          </div>
        ) : null}
      </div>

      <Button onClick={() => void handleSave()} disabled={loading || uploading} className="w-full h-12 mt-2 bg-[#FB923C] hover:opacity-90 text-base font-semibold text-white">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
        {saved ? '저장 완료' : existingId ? '식단 수정' : '식단 저장'}
      </Button>
    </div>
  )
}
