'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExpenseForm } from './expense-form'
import { SleepForm } from './sleep-form'
import { ExerciseForm } from './exercise-form'
import { MoodForm } from './mood-form'
import { DietForm } from './diet-form'
import { today, formatDate } from '@/lib/utils'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { parseISO, addDays, subDays, format } from 'date-fns'

const TIPS: Record<string, { emoji: string; title: string; body: string }> = {
  expense: { emoji: '💸', title: '지출 팁', body: '카테고리별로 나눠 기록하면 월말에 어디서 돈이 나갔는지 한눈에 보여요.' },
  sleep: { emoji: '😴', title: '수면 팁', body: '취침 시간과 기상 시간을 입력하면 수면 시간이 자동 계산돼요. 7~9시간이 권장이에요.' },
  exercise: { emoji: '💪', title: '운동 팁', body: '여러 종류의 운동을 따로 추가할 수 있어요. 히트맵에서 꾸준함을 확인해 보세요!' },
  mood: { emoji: '😊', title: '기분 팁', body: '매일 기록하면 수면·운동과의 상관관계를 인사이트 페이지에서 확인할 수 있어요.' },
  diet: { emoji: '🍚', title: '식단 팁', body: '먹은 걸 간단히 메모해 두면 나중에 식습관 패턴을 파악하는 데 도움이 돼요.' },
}

export function LogContainer() {
  const [date, setDate] = useState(today())
  const [activeTab, setActiveTab] = useState('expense')
  const todayStr = today()
  const isToday = date === todayStr

  const goPrev = () => setDate(format(subDays(parseISO(date), 1), 'yyyy-MM-dd'))
  const goNext = () => { if (!isToday) setDate(format(addDays(parseISO(date), 1), 'yyyy-MM-dd')) }

  const tip = TIPS[activeTab]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      {/* 왼쪽: 폼 */}
      <div>
        {/* 날짜 선택 */}
        <div className="flex items-center gap-3 mb-5 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-3">
          <button onClick={goPrev}
            className="p-2 rounded-xl hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-all">
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1 text-center">
            <input type="date" value={date} max={todayStr}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              className="sr-only" id="date-picker" />
            <label htmlFor="date-picker" className="cursor-pointer block">
              <p className="text-base font-semibold">{formatDate(date)}</p>
              {isToday && <span className="text-xs text-[hsl(var(--primary))] font-medium">오늘</span>}
            </label>
          </div>
          <button onClick={goNext} disabled={isToday}
            className="p-2 rounded-xl hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* 탭 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 w-full mb-6 bg-[hsl(var(--card))] h-11">
            <TabsTrigger value="expense" className="text-xs px-1">💸 지출</TabsTrigger>
            <TabsTrigger value="sleep" className="text-xs px-1">😴 수면</TabsTrigger>
            <TabsTrigger value="exercise" className="text-xs px-1">💪 운동</TabsTrigger>
            <TabsTrigger value="mood" className="text-xs px-1">😊 기분</TabsTrigger>
            <TabsTrigger value="diet" className="text-xs px-1">🍚 식단</TabsTrigger>
          </TabsList>
          <TabsContent value="expense"><ExpenseForm date={date} /></TabsContent>
          <TabsContent value="sleep"><SleepForm date={date} /></TabsContent>
          <TabsContent value="exercise"><ExerciseForm date={date} /></TabsContent>
          <TabsContent value="mood"><MoodForm date={date} /></TabsContent>
          <TabsContent value="diet"><DietForm date={date} /></TabsContent>
        </Tabs>
      </div>

      {/* 오른쪽: 팁 패널 (데스크탑만) */}
      <div className="hidden lg:flex flex-col gap-4">
        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5 sticky top-6">
          <div className="text-3xl mb-3">{tip.emoji}</div>
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-1.5">{tip.title}</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{tip.body}</p>
        </div>

        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={15} className="text-[hsl(var(--muted-foreground))]" />
            <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">기록 안내</span>
          </div>
          <ul className="space-y-2 text-xs text-[hsl(var(--muted-foreground))]">
            <li>• 과거 날짜도 ← 버튼으로 이동해서 기록 가능</li>
            <li>• 지출·운동은 같은 날 여러 건 추가 가능</li>
            <li>• 수면·기분·식단은 하루에 하나, 수정 가능</li>
            <li>• 데이터가 쌓이면 인사이트가 자동 생성돼요</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
