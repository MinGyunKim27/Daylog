import { ExerciseLog, Expense, InsightItem, MoodLog, SleepLog } from '@/types'

function avg(values: number[]): number {
  if (!values.length) return 0
  const total = values.reduce((sum, value) => sum + value, 0)
  return Math.round((total / values.length) * 10) / 10
}

export function computeInsights(
  sleepLogs: SleepLog[],
  moodLogs: MoodLog[],
  exerciseLogs: ExerciseLog[],
  expenses: Expense[]
): InsightItem[] {
  const insights: InsightItem[] = []

  const moodByDate = new Map(moodLogs.map((m) => [m.date, m.score]))
  const sleepByDate = new Map(sleepLogs.map((s) => [s.date, Number(s.duration_hours)]))
  const exerciseDates = new Set(exerciseLogs.map((e) => e.date))

  const moodWithSleep = Array.from(moodByDate.keys()).filter((date) => sleepByDate.has(date))
  if (moodWithSleep.length >= 5) {
    const goodSleepMood = moodWithSleep
      .filter((d) => (sleepByDate.get(d) ?? 0) >= 7)
      .map((d) => moodByDate.get(d) ?? 0)

    const shortSleepMood = moodWithSleep
      .filter((d) => (sleepByDate.get(d) ?? 0) < 7)
      .map((d) => moodByDate.get(d) ?? 0)

    if (goodSleepMood.length >= 2 && shortSleepMood.length >= 2) {
      const diff = Math.round((avg(goodSleepMood) - avg(shortSleepMood)) * 10) / 10
      if (diff > 0) {
        insights.push({
          icon: '😴',
          title: '수면과 기분 상관관계',
          text: `7시간 이상 잔 날의 기분 점수가 평균 ${diff}점 높아요.`,
          type: 'positive',
        })
      }
    }
  }

  const exerciseMood = moodLogs.filter((m) => exerciseDates.has(m.date)).map((m) => m.score)
  const noExerciseMood = moodLogs.filter((m) => !exerciseDates.has(m.date)).map((m) => m.score)
  if (exerciseMood.length >= 2 && noExerciseMood.length >= 2) {
    const diff = Math.round((avg(exerciseMood) - avg(noExerciseMood)) * 10) / 10
    if (diff > 0) {
      insights.push({
        icon: '💪',
        title: '운동한 날의 기분',
        text: `운동한 날의 기분 점수가 평균 ${diff}점 높아요.`,
        type: 'positive',
      })
    }
  }

  if (expenses.length >= 5) {
    const byCategory = expenses.reduce<Record<string, number>>((acc, cur) => {
      acc[cur.category] = (acc[cur.category] ?? 0) + cur.amount
      return acc
    }, {})

    const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]
    if (top) {
      insights.push({
        icon: '💸',
        title: '지출 패턴',
        text: `최근 지출에서 '${top[0]}' 비중이 가장 높아요 (${top[1].toLocaleString('ko-KR')}원).`,
        type: 'neutral',
      })
    }
  }

  if (!insights.length) {
    insights.push({
      icon: '📈',
      title: '인사이트 준비 중',
      text: '기록이 1~2주 쌓이면 개인 패턴을 더 정확하게 분석할 수 있어요.',
      type: 'tip',
    })
  }

  return insights
}
