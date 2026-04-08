import { SleepLog, MoodLog, ExerciseLog, Expense, InsightItem } from '@/types'

function avg(nums: number[]): number {
  if (!nums.length) return 0
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10
}

export function computeInsights(
  sleepLogs: SleepLog[],
  moodLogs: MoodLog[],
  exerciseLogs: ExerciseLog[],
  expenses: Expense[]
): InsightItem[] {
  const insights: InsightItem[] = []

  // Build maps by date
  const sleepByDate: Record<string, number> = {}
  for (const s of sleepLogs) sleepByDate[s.date] = Number(s.duration_hours)

  const moodByDate: Record<string, number> = {}
  for (const m of moodLogs) moodByDate[m.date] = m.score

  const exerciseByDate: Record<string, number> = {}
  for (const e of exerciseLogs) exerciseByDate[e.date] = (exerciseByDate[e.date] ?? 0) + e.duration_minutes

  const expenseByDate: Record<string, number> = {}
  for (const e of expenses) expenseByDate[e.date] = (expenseByDate[e.date] ?? 0) + e.amount

  // --- Insight 1: Sleep ≥7h vs mood ---
  const datesWithBoth = Object.keys(sleepByDate).filter((d) => moodByDate[d] !== undefined)
  if (datesWithBoth.length >= 5) {
    const goodSleepMoods = datesWithBoth.filter((d) => sleepByDate[d] >= 7).map((d) => moodByDate[d])
    const badSleepMoods = datesWithBoth.filter((d) => sleepByDate[d] < 7).map((d) => moodByDate[d])

    if (goodSleepMoods.length >= 2 && badSleepMoods.length >= 2) {
      const goodAvg = avg(goodSleepMoods)
      const badAvg = avg(badSleepMoods)
      const diff = Math.round((goodAvg - badAvg) * 10) / 10
      if (diff > 0) {
        insights.push({
          icon: '😴',
          title: '수면과 기분의 상관관계',
          text: `수면 7시간 이상인 날 기분 점수가 평균 ${diff}점 높아요 (${goodAvg}점 vs ${badAvg}점)`,
          type: 'positive',
        })
      } else if (diff < 0) {
        insights.push({
          icon: '😴',
          title: '수면 패턴',
          text: `수면과 기분의 뚜렷한 상관관계가 아직 없어요. 데이터가 더 쌓이면 분석할 수 있어요.`,
          type: 'neutral',
        })
      }
    }
  }

  // --- Insight 2: Exercise vs mood ---
  const exerciseDates = Object.keys(exerciseByDate)
  const datesWithMood = Object.keys(moodByDate)
  if (exerciseDates.length >= 3 && datesWithMood.length >= 5) {
    const exerciseMoods = exerciseDates.filter((d) => moodByDate[d]).map((d) => moodByDate[d])
    const noExerciseMoods = datesWithMood.filter((d) => !exerciseByDate[d]).map((d) => moodByDate[d])

    if (exerciseMoods.length >= 2 && noExerciseMoods.length >= 2) {
      const exAvg = avg(exerciseMoods)
      const noExAvg = avg(noExerciseMoods)
      const diff = Math.round((exAvg - noExAvg) * 10) / 10
      if (diff > 0) {
        insights.push({
          icon: '🏃',
          title: '운동과 기분',
          text: `운동한 날 기분 점수가 평균 ${diff}점 높아요 (${exAvg}점 vs ${noExAvg}점)`,
          type: 'positive',
        })
      }
    }
  }

  // --- Insight 3: Average sleep ---
  if (sleepLogs.length >= 3) {
    const recentSleep = sleepLogs.slice(-7).map((s) => Number(s.duration_hours))
    const avgSleep = avg(recentSleep)
    if (avgSleep < 6) {
      insights.push({
        icon: '⚠️',
        title: '수면 부족 주의',
        text: `최근 7일 평균 수면이 ${avgSleep}시간으로 권장량(7~9시간)보다 부족해요`,
        type: 'tip',
      })
    } else if (avgSleep >= 7) {
      insights.push({
        icon: '✅',
        title: '건강한 수면 유지 중',
        text: `최근 7일 평균 수면이 ${avgSleep}시간으로 권장 수준이에요!`,
        type: 'positive',
      })
    }
  }

  // --- Insight 4: Most exercise type ---
  if (exerciseLogs.length >= 3) {
    const typeCounts: Record<string, number> = {}
    for (const e of exerciseLogs) typeCounts[e.type] = (typeCounts[e.type] ?? 0) + 1
    const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]
    const totalDays = Object.keys(exerciseByDate).length
    insights.push({
      icon: '💪',
      title: '운동 통계',
      text: `가장 자주 한 운동은 '${topType[0]}'이에요. 총 ${totalDays}일 운동했어요!`,
      type: 'positive',
    })
  }

  // --- Insight 5: Top expense category ---
  if (expenses.length >= 5) {
    const catTotals: Record<string, number> = {}
    for (const e of expenses) catTotals[e.category] = (catTotals[e.category] ?? 0) + e.amount
    const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]
    const total = Object.values(catTotals).reduce((a, b) => a + b, 0)
    const pct = Math.round((topCat[1] / total) * 100)
    insights.push({
      icon: '💰',
      title: '지출 패턴',
      text: `지출의 ${pct}%가 '${topCat[0]}'에 집중돼 있어요 (${topCat[1].toLocaleString('ko-KR')}원)`,
      type: pct > 60 ? 'tip' : 'neutral',
    })
  }

  // --- Insight 6: Exercise streak ---
  const allDates = Object.keys(exerciseByDate).sort()
  if (allDates.length >= 2) {
    let streak = 1
    let maxStreak = 1
    for (let i = 1; i < allDates.length; i++) {
      const prev = new Date(allDates[i - 1])
      const curr = new Date(allDates[i])
      const diff = (curr.getTime() - prev.getTime()) / 86400000
      if (diff === 1) {
        streak++
        maxStreak = Math.max(maxStreak, streak)
      } else {
        streak = 1
      }
    }
    if (maxStreak >= 3) {
      insights.push({
        icon: '🔥',
        title: '운동 연속 기록',
        text: `최대 ${maxStreak}일 연속 운동 기록이 있어요! 꾸준함이 최고예요.`,
        type: 'positive',
      })
    }
  }

  // Fallback if no data
  if (insights.length === 0) {
    insights.push({
      icon: '📊',
      title: '데이터를 더 쌓아봐요',
      text: '5가지 지표를 1~2주 기록하면 개인 맞춤 인사이트가 나타나요!',
      type: 'tip',
    })
  }

  return insights
}
