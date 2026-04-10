'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { DietLog, Profile } from '@/types'
import { getRecommendedCalories } from '@/lib/health'
import { getDietTotalCalories } from '@/lib/utils'
import { CheckCircle2, ChevronDown, ImagePlus, Loader2, Sparkles, X } from 'lucide-react'

const MEALS = [
  { key: 'breakfast' as const, label: '아침', emoji: '🍳', placeholder: '아침 메뉴' },
  { key: 'lunch' as const, label: '점심', emoji: '🍱', placeholder: '점심 메뉴' },
  { key: 'dinner' as const, label: '저녁', emoji: '🍽️', placeholder: '저녁 메뉴' },
]

type MealKey = 'breakfast' | 'lunch' | 'dinner'

interface Props {
  date: string
}

export function DietForm({ date }: Props) {
  const [meals, setMeals] = useState({ breakfast: '', lunch: '', dinner: '' })
  const [mealCalories, setMealCalories] = useState({ breakfast: '', lunch: '', dinner: '' })
  const [mealReasons, setMealReasons] = useState({ breakfast: '', lunch: '', dinner: '' })
  const [reasonOpen, setReasonOpen] = useState({ breakfast: false, lunch: false, dinner: false })
  const [mealPhotos, setMealPhotos] = useState({ breakfast: '', lunch: '', dinner: '' })
  const [uploadingMeal, setUploadingMeal] = useState<MealKey | null>(null)
  const [snacks, setSnacks] = useState<string[]>([])
  const [snackInput, setSnackInput] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [existingId, setExistingId] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [loading, setLoading] = useState(false)
  const [estimating, setEstimating] = useState(false)
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
        setMealCalories({
          breakfast: data.breakfast_calories ? String(data.breakfast_calories) : '',
          lunch: data.lunch_calories ? String(data.lunch_calories) : '',
          dinner: data.dinner_calories ? String(data.dinner_calories) : '',
        })
        setMealPhotos({
          breakfast: data.breakfast_photo_url ?? '',
          lunch: data.lunch_photo_url ?? '',
          dinner: data.dinner_photo_url ?? '',
        })
        setSnacks(data.snacks ?? [])
        setExistingId(data.id)
      } else {
        setMeals({ breakfast: '', lunch: '', dinner: '' })
        setMealCalories({ breakfast: '', lunch: '', dinner: '' })
        setMealPhotos({ breakfast: '', lunch: '', dinner: '' })
        setSnacks([])
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
  const totalCalories = useMemo(() => {
    return (
      Number(mealCalories.breakfast || 0) +
      Number(mealCalories.lunch || 0) +
      Number(mealCalories.dinner || 0)
    )
  }, [mealCalories.breakfast, mealCalories.dinner, mealCalories.lunch])

  const calorieGap = useMemo(() => {
    if (!recommendedCalories || !totalCalories) return null
    return recommendedCalories - totalCalories
  }, [recommendedCalories, totalCalories])

  async function handleMealPhotoUpload(file: File, mealKey: MealKey) {
    setUploadingMeal(mealKey)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setUploadingMeal(null)
      setError('로그인 정보가 만료되었습니다. 다시 로그인해 주세요.')
      return
    }

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/${date}-${mealKey}-${Date.now()}.${ext}`

    const { error } = await supabase.storage.from('meal-photos').upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    })

    if (error) {
      setError('사진 업로드에 실패했습니다.')
      setUploadingMeal(null)
      return
    }

    const { data } = supabase.storage.from('meal-photos').getPublicUrl(path)
    setMealPhotos((prev) => ({ ...prev, [mealKey]: data.publicUrl }))
    setUploadingMeal(null)
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

  async function handleEstimateCalories() {
    const hasAnyMeal = meals.breakfast || meals.lunch || meals.dinner || snacks.length > 0
    if (!hasAnyMeal) return

    const hasExistingCalories = mealCalories.breakfast || mealCalories.lunch || mealCalories.dinner
    if (hasExistingCalories) {
      const confirmed = window.confirm('이미 입력된 칼로리 값이 있어요. AI 추정값으로 덮어쓸까요?')
      if (!confirmed) return
    }

    setEstimating(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/calories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          breakfast: meals.breakfast,
          lunch: meals.lunch,
          dinner: meals.dinner,
          snacks,
        }),
      })

      if (!response.ok) {
        setError('칼로리 추정에 실패했습니다. 다시 시도해 주세요.')
        return
      }

      const result = await response.json() as {
        breakfast: number | null
        lunch: number | null
        dinner: number | null
        snacks: number[]
      }

      setMealCalories((prev) => ({
        breakfast: result.breakfast ? String(result.breakfast) : prev.breakfast,
        lunch: result.lunch ? String(result.lunch) : prev.lunch,
        dinner: result.dinner ? String(result.dinner) : prev.dinner,
      }))
      setMealReasons({
        breakfast: (result as { breakfast_reason?: string | null }).breakfast_reason ?? '',
        lunch: (result as { lunch_reason?: string | null }).lunch_reason ?? '',
        dinner: (result as { dinner_reason?: string | null }).dinner_reason ?? '',
      })
    } catch {
      setError('칼로리 추정 중 오류가 발생했습니다.')
    } finally {
      setEstimating(false)
    }
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
        breakfast_calories: mealCalories.breakfast ? Number(mealCalories.breakfast) : null,
        breakfast_photo_url: mealPhotos.breakfast || null,
        lunch: meals.lunch || null,
        lunch_calories: mealCalories.lunch ? Number(mealCalories.lunch) : null,
        lunch_photo_url: mealPhotos.lunch || null,
        dinner: meals.dinner || null,
        dinner_calories: mealCalories.dinner ? Number(mealCalories.dinner) : null,
        dinner_photo_url: mealPhotos.dinner || null,
        snacks: snacks.length ? snacks : null,
        calories: totalCalories || null,
        photo_url: mealPhotos.breakfast || mealPhotos.lunch || mealPhotos.dinner || null,
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

      <button
        onClick={() => void handleEstimateCalories()}
        disabled={estimating || (!meals.breakfast && !meals.lunch && !meals.dinner && !snacks.length)}
        className="w-full h-10 rounded-xl border border-[#FB923C]/50 bg-[#FB923C]/10 text-[#FB923C] text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40"
      >
        {estimating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
        {estimating ? 'AI 추정 중...' : 'AI로 칼로리 자동 채우기'}
      </button>

      {MEALS.map(({ key, label, emoji, placeholder }) => (
        <div key={key} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 space-y-2">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{emoji} {label}</p>

          <div className="grid grid-cols-[1fr_120px] gap-2">
            <input
              type="text"
              value={meals[key]}
              onChange={(event) => setMeals((prev) => ({ ...prev, [key]: event.target.value }))}
              placeholder={placeholder}
              className="h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm"
            />
            <div className="flex gap-1">
              <input
                type="number"
                value={mealCalories[key]}
                onChange={(event) => setMealCalories((prev) => ({ ...prev, [key]: event.target.value }))}
                placeholder="0 kcal"
                className="w-full h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              {mealReasons[key] && (
                <button
                  type="button"
                  onClick={() => setReasonOpen((prev) => ({ ...prev, [key]: !prev[key] }))}
                  className="shrink-0 w-9 h-11 rounded-xl border border-[#FB923C]/40 bg-[#FB923C]/10 text-[#FB923C] flex items-center justify-center transition-colors hover:bg-[#FB923C]/20"
                  title="AI 추정 근거"
                >
                  <ChevronDown size={14} className={`transition-transform ${reasonOpen[key] ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {mealReasons[key] && reasonOpen[key] && (
            <div className="text-xs text-[#FB923C] bg-[#FB923C]/8 border border-[#FB923C]/20 rounded-lg px-3 py-2">
              💡 {mealReasons[key]}
            </div>
          )}

          {mealPhotos[key] ? (
            <div className="relative">
              <img src={mealPhotos[key]} alt={`${label} 사진`} className="w-full h-36 rounded-xl object-cover border border-[hsl(var(--border))]" />
              <button
                onClick={() => setMealPhotos((prev) => ({ ...prev, [key]: '' }))}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                aria-label="사진 삭제"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] cursor-pointer hover:text-[hsl(var(--foreground))] transition-colors w-fit">
              {uploadingMeal === key ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ImagePlus size={14} />
              )}
              {uploadingMeal === key ? '업로드 중...' : `${label} 사진 추가`}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingMeal !== null}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void handleMealPhotoUpload(file, key)
                }}
              />
            </label>
          )}
        </div>
      ))}

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3">
        <p className="text-xs text-[hsl(var(--muted-foreground))]">자동 계산 총 칼로리</p>
        <p className="text-xl font-bold text-[#FB923C]">{getDietTotalCalories({
          id: '',
          user_id: '',
          date,
          breakfast: meals.breakfast || null,
          breakfast_calories: mealCalories.breakfast ? Number(mealCalories.breakfast) : null,
          lunch: meals.lunch || null,
          lunch_calories: mealCalories.lunch ? Number(mealCalories.lunch) : null,
          dinner: meals.dinner || null,
          dinner_calories: mealCalories.dinner ? Number(mealCalories.dinner) : null,
          snacks,
          calories: totalCalories || null,
          photo_url: null,
          breakfast_photo_url: null,
          lunch_photo_url: null,
          dinner_photo_url: null,
          created_at: '',
        }).toLocaleString('ko-KR')} kcal</p>
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

      <Button onClick={() => void handleSave()} disabled={loading} className="w-full h-12 mt-2 bg-[#FB923C] hover:opacity-90 text-base font-semibold text-white">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
        {saved ? '저장 완료' : existingId ? '식단 수정' : '식단 저장'}
      </Button>
    </div>
  )
}
