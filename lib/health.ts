import { Profile } from '@/types'

const ACTIVITY_MULTIPLIERS: Record<NonNullable<Profile['activity_level']>, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

const MET_BY_EXERCISE: Record<string, { low: number; medium: number; high: number }> = {
  러닝: { low: 7, medium: 9.8, high: 11.5 },
  걷기: { low: 2.8, medium: 3.5, high: 4.5 },
  자전거: { low: 4, medium: 6.8, high: 9.5 },
  수영: { low: 5.8, medium: 8, high: 10 },
  웨이트: { low: 3.5, medium: 5, high: 6 },
  필라테스: { low: 3, medium: 3.5, high: 4.5 },
  축구: { low: 7, medium: 8.5, high: 10 },
  기타: { low: 3, medium: 5, high: 7 },
}

export function hasBodyProfile(profile: Profile | null): boolean {
  if (!profile) return false
  return !!(profile.sex && profile.birth_year && profile.height_cm && profile.weight_kg)
}

export function calcAge(birthYear: number): number {
  return new Date().getFullYear() - birthYear
}

export function calcBmr(profile: Profile): number | null {
  if (!profile.sex || !profile.birth_year || !profile.height_cm || !profile.weight_kg) {
    return null
  }

  const age = calcAge(profile.birth_year)
  const base =
    profile.sex === 'male'
      ? 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * age + 5
      : 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * age - 161

  const muscleBoost = profile.muscle_kg ? Math.max(0, (profile.muscle_kg - 25) * 8) : 0
  return Math.round(base + muscleBoost)
}

export function calcTdee(profile: Profile): number | null {
  const bmr = calcBmr(profile)
  if (!bmr || !profile.activity_level) return null
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[profile.activity_level])
}

export function calcExerciseCalories(
  weightKg: number | null,
  exerciseType: string,
  intensity: 'low' | 'medium' | 'high',
  durationMinutes: number
): number | null {
  if (!weightKg || durationMinutes <= 0) return null

  const metMap = MET_BY_EXERCISE[exerciseType] ?? MET_BY_EXERCISE['기타']
  const met = metMap[intensity]
  const kcal = (met * 3.5 * weightKg * durationMinutes) / 200

  return Math.round(kcal)
}

export function getRecommendedCalories(profile: Profile | null): number | null {
  if (!profile) return null
  return calcTdee(profile)
}
